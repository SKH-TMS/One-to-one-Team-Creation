import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITeam extends Document {
  teamID: string;
  teamName: string;
  members: { email: string; userId: string }[];
  teamLeader: { email: string; userId: string };
  createdAt: Date;
}

// Define Team Schema
const teamSchema = new Schema<ITeam>(
  {
    teamID: {
      type: String,
      unique: true,
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    members: [
      {
        email: {
          type: String,
          required: [true, "email is required"],
          match: [
            /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/,
            "Invalid email format",
          ],
          lowercase: true,
          trim: true,
        },
        userId: { type: String, required: true },
      },
    ],
    teamLeader: {
      email: { type: String, required: true },
      userId: { type: String, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to assign auto-incremented `teamID`
teamSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastTeam = await mongoose
    .model<ITeam>("Team")
    .findOne({}, { teamID: 1 })
    .sort({ teamID: -1 });

  let newTeamID = "Team-1"; // Default for the first team

  if (lastTeam && lastTeam.teamID) {
    const match = lastTeam.teamID.match(/\d+$/);
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newTeamID = `Team-${maxNumber + 1}`;
  }

  this.teamID = newTeamID;
  next();
});

// Export Team Model
const Team = models?.Team || model<ITeam>("Team", teamSchema);
export default Team;
