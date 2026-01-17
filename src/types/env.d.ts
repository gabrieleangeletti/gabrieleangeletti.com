/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        VO2_API_BASE_URL: string;
        VO2_API_KEY: string;
      };
    };
  }
}
