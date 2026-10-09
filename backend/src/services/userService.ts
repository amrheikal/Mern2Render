import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { orderModel } from "../models/orderModel";

interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const register = async ({
  firstName,
  lastName,
  email,
  password,
}: RegisterParams) => {
  const findUser = await userModel.findOne({ email });

  if (findUser) {
    return { data: "User already exists!", statusCode: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userModel({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });
  await newUser.save();

  return {
    data: generateJWT({ firstName, lastName, email, isAdmin: newUser.isAdmin }),
    statusCode: 200,
  };
};

interface LoginParams {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginParams) => {
  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    return { data: "Incorrect email or password!", statusCode: 400 };
  }

  const passwordMatch = await bcrypt.compare(password, findUser.password);
  if (passwordMatch) {
    return {
      data: generateJWT({
        email,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        isAdmin: findUser.isAdmin,
      }),
      statusCode: 200,
    };
  }

  return { data: "Incorrect email or password!", statusCode: 400 };
};

interface GetMyOrdersParams {
  userId: string;
}

export const getMyOrders = async ({ userId }: GetMyOrdersParams) => {
  try {
    const orders = await orderModel.find({ userId });
    return { data: orders, statusCode: 200 };
  } catch (error) {
    console.error(error);
    return { data: "Something went wrong!", statusCode: 500 };
  }
};



// Creates (or promotes) the dashboard admin from the credentials in .env.
export const seedAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn(
        "ADMIN_EMAIL / ADMIN_PASSWORD are not set - skipping admin seeding."
      );
      return;
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (!existingUser.isAdmin) {
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log(`Promoted existing user to admin: ${email}`);
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      firstName: "Store",
      lastName: "Admin",
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    console.log(`Admin user created: ${email}`);
  } catch (err) {
    console.error("cannot seed admin user", err);
  }
};

const generateJWT = (data: any) => {
  return jwt.sign(data, process.env.JWT_SECRET || "");
};
