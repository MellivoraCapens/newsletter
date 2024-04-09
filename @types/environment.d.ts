export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      MONGO_URI: string;
      NODE_ENV: "test" | "development" | "product";
      JWT_SECRET: jwt.Secret;
      JWT_EXPIRE: any;
      JWT_COOKIE_EXPIRE: number;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_EMAIL: string;
      SMTP_PASSWORD: string;
      FROM_EMAIL: string;
      FROM_NAME: string;
      BUCKET_NAME: string;
      BUCKET_REGION: string;
      BUCKET_ACCESS_KEY: string;
      BUCKET_SECRET_KEY: string;
      DEFAULT_PROFILE_PICTURE: string;
      ATLAS_SEARCH_URL: string;
      ATLAS_SEARCH_API_KEY: string;
    }
  }
}
