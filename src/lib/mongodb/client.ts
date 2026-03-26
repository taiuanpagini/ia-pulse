import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI não está definida nas variáveis de ambiente.");
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) {
    return global._mongooseConn;
  }

  const conn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  global._mongooseConn = conn;
  return conn;
}
