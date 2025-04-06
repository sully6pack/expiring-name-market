
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface EmailConfig {
  serviceId: string;
  userId: string;
}

const EmailConfigBanner = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<EmailConfig>({
    serviceId: "",
    userId: "",
  });

  // Check if email is already configured
  useEffect(() => {
    const savedConfig = localStorage.getItem("emailjs_config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setIsConfigured(true);
      } catch (e) {
        console.error("Failed to parse email config:", e);
      }
    }
  }, []);

  const handleSave = () => {
    if (!config.serviceId || !config.userId) {
      toast.error("Please provide both Service ID and User ID");
      return;
    }

    localStorage.setItem("emailjs_config", JSON.stringify(config));
    setIsConfigured(true);
    setIsOpen(false);
    
    // Reload the page to apply the new config
    toast.success("Email configuration saved successfully!");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (isConfigured && !isOpen) {
    return null;
  }

  return (
    <div className="bg-gray-100 border-b p-4">
      <div className="container mx-auto">
        {!isOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="text-brand-blue h-5 w-5" />
              <span>Configure email notifications to enable user communications</span>
            </div>
            <Button onClick={() => setIsOpen(true)}>
              Configure Email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configure Email Notifications</h3>
            <p className="text-sm text-gray-500">
              To enable email notifications, please configure your EmailJS credentials. 
              <a 
                href="https://www.emailjs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 ml-1 hover:underline"
              >
                Sign up for EmailJS
              </a>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">EmailJS Service ID</Label>
                <Input 
                  id="serviceId" 
                  value={config.serviceId} 
                  onChange={(e) => setConfig({...config, serviceId: e.target.value})}
                  placeholder="e.g., service_your_service_id"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userId">EmailJS User ID</Label>
                <Input 
                  id="userId" 
                  value={config.userId} 
                  onChange={(e) => setConfig({...config, userId: e.target.value})}
                  placeholder="e.g., user_your_user_id"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfigBanner;
