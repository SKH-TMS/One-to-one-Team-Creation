import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { teamName, selectedMembers, teamLeader } = await req.json();

    if (
      !teamName ||
      selectedMembers.length === 0 ||
      !teamLeader?.email ||
      !teamLeader?.userId
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ Ensure correct data format
    const newTeam = new Team({
      teamName,
      members: selectedMembers.map(
        (member: { email: string; userId: string }) => ({
          email: member.email,
          userId: member.userId,
        })
      ),
      teamLeader: {
        email: teamLeader.email,
        userId: teamLeader.userId, // ✅ Storing userId separately
      },
    });

    await newTeam.save();

    // ✅ Update the user's role to "Team Leader"
    await User.findOneAndUpdate(
      { email: teamLeader.email },
      { userRole: "Team Leader" }
    );

    // ✅ Update all selected team members to "Team Member"
    await User.updateMany(
      {
        email: {
          $in: selectedMembers.map(
            (member: { email: string; userId: string }) => member.email
          ),
        },
      },
      { userRole: "Team Member" }
    );

    return NextResponse.json({
      success: true,
      message: "Team created successfully! Team roles updated.",
    });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create team" },
      { status: 500 }
    );
  }
}
