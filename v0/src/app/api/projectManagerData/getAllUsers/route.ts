import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getToken, GetuserRole } from "@/utils/token";

export async function GET(req: NextRequest) {
  try {
    // Extract token from request
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }
    const userRole = await GetuserRole(token);
    if (!userRole || userRole != "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access you are not an Project Manager",
        },
        { status: 401 }
      );
    }
    // Connect to MongoDB using Mongoose
    await connectToDatabase();

    // ✅ Fetch only users with `userRole: "User"`
    const users = await User.find({ userRole: "User" }).select(
      "firstname lastname email UserId"
    ); // Return only necessary fields

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}
