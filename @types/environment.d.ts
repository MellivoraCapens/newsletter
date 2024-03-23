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
    }
  }
}
