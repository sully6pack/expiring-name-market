
import { Domain } from "./index";

declare global {
  interface Window {
    globalDomains: Domain[];
  }
}

export {};
