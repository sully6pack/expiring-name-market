
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the WhoisXML API key from environment variable
const WHOISXML_API_KEY = Deno.env.get("WHOISXML_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, domain, verificationCode } = await req.json();

    // Validate required parameters
    if (!action || !domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log all incoming requests for easier debugging
    console.log(`Domain verification request:`, { action, domain, verificationCodeProvided: !!verificationCode });

    // Check if API key is configured only for actions requiring it
    if ((action === "getExpirationDate" || action === "getWhoisEmail" || action === "verifyDomain") && !WHOISXML_API_KEY) {
      console.warn("WhoisXML API key not configured");
    }

    console.log(`Processing ${action} request for domain: ${domain}`);

    // Handle different actions
    switch (action) {
      case "getExpirationDate":
        return await getExpirationDate(domain);
      case "getWhoisEmail":
        return await getWhoisEmail(domain);
      case "checkDnsTxtRecord":
        if (!verificationCode) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing verification code" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        return await checkDnsTxtRecord(domain, verificationCode);
      case "verifyDomain":
        return await verifyDomainExists(domain);
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Verify if a domain exists and is valid
async function verifyDomainExists(domain: string) {
  try {
    console.log(`Verifying domain exists: ${domain}`);
    
    // Domain format validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.log(`Domain format validation failed for: ${domain}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: false,
          reason: "invalid_format"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // IMPORTANT: Perform a DNS lookup to verify domain existence
    try {
      const dnsUrl = `https://dns.google/resolve?name=${domain}&type=A`;
      console.log(`Performing DNS lookup for ${domain} using Google DNS API`);
      
      const dnsResponse = await fetch(dnsUrl);
      
      if (!dnsResponse.ok) {
        console.error(`DNS API error: ${dnsResponse.status} ${dnsResponse.statusText}`);
        // Continue to WhoisXML API or fallback validation
      } else {
        const dnsData = await dnsResponse.json();
        
        // If we get a valid response with answers or authority records, the domain likely exists
        if ((dnsData.Answer && dnsData.Answer.length > 0) || 
            (dnsData.Authority && dnsData.Authority.length > 0)) {
          console.log(`DNS lookup confirmed domain ${domain} exists`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              isValid: true,
              source: "dns_lookup"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // If NXDOMAIN response, the domain doesn't exist
        if (dnsData.Status === 3) { // NXDOMAIN
          console.log(`DNS lookup shows domain ${domain} does not exist (NXDOMAIN)`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              isValid: false,
              reason: "domain_not_found",
              source: "dns_lookup"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`DNS lookup for ${domain} was inconclusive`);
        // Continue to WhoisXML API or fallback validation
      }
    } catch (dnsError) {
      console.error(`Error during DNS lookup for ${domain}:`, dnsError);
      // Continue to WhoisXML API or fallback validation
    }
    
    // If we have a WhoisXML API key, use the actual API
    if (WHOISXML_API_KEY) {
      try {
        const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
        console.log(`Making WhoisXML API request for ${domain}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              isValid: false,
              reason: "api_error",
              details: `API returned ${response.status}`
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const data = await response.json();
        console.log(`Received WhoisXML response for ${domain}`);
        
        // Check for error messages in the response
        if (data.ErrorMessage) {
          console.log(`WhoisXML API error for ${domain}: ${data.ErrorMessage.msg}`);
          
          // Special case for "Domain not found"
          if (data.ErrorMessage.msg.includes("Domain not found")) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                isValid: false,
                reason: "domain_not_found"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              isValid: false,
              reason: "whois_error",
              details: data.ErrorMessage.msg
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // If we got here, the domain exists
        return new Response(
          JSON.stringify({ 
            success: true, 
            isValid: true,
            source: "whois"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (apiError) {
        console.error(`Error using WhoisXML API for ${domain}:`, apiError);
      }
    }
    
    // If we reached here and no definitive answer, fall back to basic validation
    // Parse the domain to check TLD
    const parts = domain.split('.');
    if (parts.length < 2) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: false,
          reason: "invalid_tld"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const tld = parts[parts.length - 1].toLowerCase();
    const validTLDs = ['com', 'org', 'net', 'io', 'co', 'dev', 'app', 'tech', 'info', 'us', 'uk', 'eu', 'ca', 'ai'];
    
    if (!validTLDs.includes(tld)) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: false,
          reason: "unsupported_tld"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const domainName = parts[parts.length - 2];
    
    // Basic validation: domain name should be at least 3 characters
    if (domainName.length < 3) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid: false,
          reason: "domain_too_short"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If we reached here without a definitive answer, be conservative
    return new Response(
      JSON.stringify({ 
        success: true, 
        isValid: false,
        reason: "verification_failed",
        details: "Could not confirm domain existence"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error verifying domain ${domain}:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Get domain expiration date
async function getExpirationDate(domain: string) {
  try {
    console.log(`Fetching expiration date for ${domain}`);
    
    // Domain format validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.log(`Invalid domain format: ${domain}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid domain format" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // If we have a WhoisXML API key, try to use it
    if (WHOISXML_API_KEY) {
      try {
        const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
        console.log(`Making WhoisXML API request for ${domain}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
          // Fall back to default date
        } else {
          const data = await response.json();
          console.log(`Received WhoisXML response for ${domain}`);
          
          // Check for error messages in the response
          if (data.ErrorMessage) {
            console.log(`WhoisXML API error for ${domain}: ${data.ErrorMessage.msg}`);
            
            // If domain not found, return error
            if (data.ErrorMessage.msg.includes("Domain not found")) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: "Domain not found in WHOIS database" 
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
              );
            }
            
            // Fall back to default date for other errors
          } else {
            // Extract expiration date from the response
            const whoisRecord = data.WhoisRecord || {};
            const registryData = whoisRecord.registryData || {};
            
            let expirationDate = null;
            
            // Try different possible paths to get the expiration date
            if (registryData.expiresDate) {
              expirationDate = registryData.expiresDate;
            } else if (whoisRecord.expiresDate) {
              expirationDate = whoisRecord.expiresDate;
            } else if (registryData.registryExpiryDate) {
              expirationDate = registryData.registryExpiryDate;
            } else if (whoisRecord.registryExpiryDate) {
              expirationDate = whoisRecord.registryExpiryDate;
            }
            
            if (expirationDate) {
              console.log(`Extracted expiration date for ${domain}: ${expirationDate}`);
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  expirationDate: new Date(expirationDate).toISOString(),
                  source: "whois" 
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            // If no expiration date found, fall back to default date
          }
        }
      } catch (apiError) {
        console.error(`Error using WhoisXML API for ${domain}:`, apiError);
        // Fall back to default date
      }
    }
    
    // Set a default expiration date 3 months from now when API is unavailable
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 3);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        expirationDate: defaultDate.toISOString(),
        source: "default" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error fetching expiration date for ${domain}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Get WHOIS email address for domain
async function getWhoisEmail(domain: string) {
  try {
    console.log(`Fetching WHOIS email for ${domain}`);
    
    // Domain format validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.log(`Invalid domain format: ${domain}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid domain format" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // If we have a WhoisXML API key, try to use the actual API
    if (WHOISXML_API_KEY) {
      try {
        const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
          // Return no email found
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "API error" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        const data = await response.json();
        
        console.log(`Received WhoisXML response for ${domain}`);
        
        // Check for error messages in the response
        if (data.ErrorMessage) {
          console.log(`WhoisXML API error for ${domain}: ${data.ErrorMessage.msg}`);
          
          // If domain not found, return error
          if (data.ErrorMessage.msg.includes("Domain not found")) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "Domain not found in WHOIS database" 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
            );
          }
          
          // Return no email found for other errors
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: data.ErrorMessage.msg 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        const whoisRecord = data.WhoisRecord || {};
        const contactEmail = whoisRecord.contactEmail || 
                          (whoisRecord.registrant && whoisRecord.registrant.email) ||
                          (whoisRecord.administrativeContact && whoisRecord.administrativeContact.email) ||
                          null;
        
        console.log(`Extracted contact email for ${domain}: ${contactEmail}`);
        
        if (contactEmail) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              email: contactEmail,
              source: "whois"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "No email found in WHOIS data" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }
      } catch (apiError) {
        console.error(`Error using WhoisXML API for ${domain}:`, apiError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Error fetching WHOIS data" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "WhoisXML API key not configured" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error fetching WHOIS email for ${domain}:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Check if DNS TXT record exists with verification code
async function checkDnsTxtRecord(domain: string, verificationCode: string) {
  try {
    console.log(`Checking DNS TXT record for ${domain} with code ${verificationCode}`);
    
    // Domain format validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.log(`Invalid domain format: ${domain}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid domain format" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Perform an actual DNS lookup to verify the TXT record
    try {
      const dnsUrl = `https://dns.google/resolve?name=${domain}&type=TXT`;
      console.log(`Checking DNS TXT records for ${domain} using Google DNS API`);
      
      const dnsResponse = await fetch(dnsUrl);
      
      if (!dnsResponse.ok) {
        console.error(`DNS API error: ${dnsResponse.status} ${dnsResponse.statusText}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "DNS API error" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      const dnsData = await dnsResponse.json();
      
      // Check if the domain has TXT records
      if (dnsData.Answer && dnsData.Answer.length > 0) {
        // Look for a TXT record containing our verification code
        const matchingRecord = dnsData.Answer.find(record => {
          return record.type === 16 && // Type 16 is TXT
                 record.data && 
                 record.data.includes(verificationCode);
        });
        
        if (matchingRecord) {
          console.log(`Found matching TXT record with verification code for ${domain}`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              isVerified: true 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          console.log(`No matching TXT record found for ${domain} with code ${verificationCode}`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              isVerified: false,
              error: "Verification code not found in DNS TXT records"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        console.log(`No TXT records found for ${domain}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            isVerified: false,
            error: "No TXT records found for domain"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (dnsError) {
      console.error(`Error checking DNS TXT records for ${domain}:`, dnsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Error checking DNS TXT records" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error checking DNS TXT record for ${domain}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
