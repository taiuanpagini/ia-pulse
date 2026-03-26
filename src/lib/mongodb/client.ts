import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) {
    return global._mongooseConn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não está definida nas variáveis de ambiente.");
  }

  const conn = await mongoose.connect(uri, { bufferCommands: false });
  global._mongooseConn = conn;
  return conn;
}
