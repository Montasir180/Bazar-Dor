import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUrl = process.env.MONGO_DB_URL;

if (!mongoUrl) {
  throw new Error("MONGO_DB_URL is missing from environment variables");
}

const client = new MongoClient(mongoUrl);
const db = client.db("bazardorweb");

const appUrl =
  process.env.BETTER_AUTH_URL || "http://localhost:3000" ||   "https://bazar-dor-bb1k.vercel.app";;

export const auth = betterAuth({
  appName: "BazarDor",

  baseURL: appUrl,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://bazar-dor-bb1k-git-main-montasir2.vercel.app",
  ],
});