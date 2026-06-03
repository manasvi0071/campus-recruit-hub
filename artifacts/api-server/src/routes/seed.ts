import { Router, type IRouter } from "express";
import { db, studentsTable, companiesTable, jobsTable, applicationsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/seed", async (req, res): Promise<void> => {
  logger.info("Seeding database with sample data");

  // must delete in FK-safe order: applications → jobs → students/companies
  await db.delete(applicationsTable);
  await db.delete(jobsTable);
  await db.delete(studentsTable);
  await db.delete(companiesTable);

  const insertedCompanies = await db.insert(companiesTable).values([
    { name: "Google", industry: "Technology", contactName: "Priya Mehta", contactEmail: "priya@google.com", avgPackageLpa: 28.0, totalHires: 45, relationshipHealth: "hot", status: "active" },
    { name: "Microsoft", industry: "Technology", contactName: "Raj Kumar", contactEmail: "raj@microsoft.com", avgPackageLpa: 24.0, totalHires: 38, relationshipHealth: "hot", status: "active" },
    { name: "TCS", industry: "IT Services", contactName: "Anjali Desai", contactEmail: "anjali@tcs.com", avgPackageLpa: 4.5, totalHires: 320, relationshipHealth: "warm", status: "active" },
    { name: "Infosys", industry: "IT Services", contactName: "Suresh Nair", contactEmail: "suresh@infosys.com", avgPackageLpa: 5.0, totalHires: 280, relationshipHealth: "warm", status: "active" },
    { name: "Amazon", industry: "E-Commerce", contactName: "Deepa Rao", contactEmail: "deepa@amazon.com", avgPackageLpa: 18.0, totalHires: 60, relationshipHealth: "hot", status: "active" },
    { name: "Wipro", industry: "IT Services", contactName: "Vijay Singh", contactEmail: "vijay@wipro.com", avgPackageLpa: 3.8, totalHires: 150, relationshipHealth: "cold", status: "active" },
    { name: "Deloitte", industry: "Consulting", contactName: "Kavita Sharma", contactEmail: "kavita@deloitte.com", avgPackageLpa: 8.0, totalHires: 85, relationshipHealth: "hot", status: "active" },
    { name: "Capgemini", industry: "IT Services", contactName: "Ravi Iyer", contactEmail: "ravi@capgemini.com", avgPackageLpa: 4.2, totalHires: 110, relationshipHealth: "warm", status: "active" },
    { name: "Cognizant", industry: "IT Services", contactName: "Meena Pillai", contactEmail: "meena@cognizant.com", avgPackageLpa: 4.8, totalHires: 140, relationshipHealth: "warm", status: "active" },
    { name: "Goldman Sachs", industry: "Finance", contactName: "Arjun Bose", contactEmail: "arjun@gs.com", avgPackageLpa: 16.0, totalHires: 15, relationshipHealth: "hot", status: "active" },
  ]).returning();

  const insertedStudents = await db.insert(studentsTable).values([
    { name: "Aarav Sharma", email: "aarav@college.edu", branch: "CSE", cgpa: 9.2, graduationYear: 2025, skills: "React,Node.js,Python", readinessScore: 92, status: "placed", phone: "9876543210" },
    { name: "Ishita Patel", email: "ishita@college.edu", branch: "ECE", cgpa: 8.8, graduationYear: 2025, skills: "C++,Embedded Systems,IoT", readinessScore: 85, status: "active", phone: "9876543211" },
    { name: "Rohan Verma", email: "rohan@college.edu", branch: "MECH", cgpa: 7.5, graduationYear: 2025, skills: "AutoCAD,SolidWorks,MATLAB", readinessScore: 64, status: "active", phone: "9876543212" },
    { name: "Priya Singh", email: "priya@college.edu", branch: "MBA", cgpa: 8.1, graduationYear: 2025, skills: "Marketing,Excel,Data Analysis", readinessScore: 78, status: "placed", phone: "9876543213" },
    { name: "Vikram Gupta", email: "vikram@college.edu", branch: "CSE", cgpa: 6.8, graduationYear: 2025, skills: "Java,SQL", readinessScore: 55, status: "active", phone: "9876543214" },
    { name: "Neha Reddy", email: "neha@college.edu", branch: "CSE", cgpa: 9.5, graduationYear: 2025, skills: "Machine Learning,Python,AWS", readinessScore: 96, status: "placed", phone: "9876543215" },
    { name: "Arjun Nair", email: "arjun@college.edu", branch: "ECE", cgpa: 7.2, graduationYear: 2025, skills: "Verilog,C", readinessScore: 60, status: "active", phone: "9876543216" },
    { name: "Ananya Desai", email: "ananya@college.edu", branch: "CSE", cgpa: 8.4, graduationYear: 2025, skills: "UI/UX,Figma,HTML/CSS", readinessScore: 82, status: "active", phone: "9876543217" },
    { name: "Karthik Iyer", email: "karthik@college.edu", branch: "MECH", cgpa: 6.2, graduationYear: 2025, skills: "Manufacturing,Quality Control", readinessScore: 42, status: "blacklisted", phone: "9876543218" },
    { name: "Meera Joshi", email: "meera@college.edu", branch: "MBA", cgpa: 8.9, graduationYear: 2025, skills: "Finance,Financial Modeling", readinessScore: 88, status: "placed", phone: "9876543219" },
    { name: "Siddharth Rao", email: "siddharth@college.edu", branch: "CSE", cgpa: 7.8, graduationYear: 2025, skills: "Go,Docker,Kubernetes", readinessScore: 75, status: "active", phone: "9876543220" },
    { name: "Riya Kapoor", email: "riya@college.edu", branch: "ECE", cgpa: 8.5, graduationYear: 2025, skills: "VLSI,Python", readinessScore: 80, status: "placed", phone: "9876543221" },
    { name: "Rahul Menon", email: "rahul@college.edu", branch: "CSE", cgpa: 9.8, graduationYear: 2025, skills: "Competitive Programming,C++,Algorithms", readinessScore: 98, status: "placed", phone: "9876543222" },
    { name: "Kriti Bhatia", email: "kriti@college.edu", branch: "MBA", cgpa: 7.6, graduationYear: 2025, skills: "HR Management,Communication", readinessScore: 68, status: "active", phone: "9876543223" },
    { name: "Aditya Chauhan", email: "aditya@college.edu", branch: "MECH", cgpa: 8.0, graduationYear: 2025, skills: "Thermodynamics,ANSYS", readinessScore: 72, status: "active", phone: "9876543224" },
  ]).returning();

  const googleId = insertedCompanies.find(c => c.name === "Google")!.id;
  const deloitteId = insertedCompanies.find(c => c.name === "Deloitte")!.id;
  const tcsId = insertedCompanies.find(c => c.name === "TCS")!.id;
  const amazonId = insertedCompanies.find(c => c.name === "Amazon")!.id;
  const microsoftId = insertedCompanies.find(c => c.name === "Microsoft")!.id;
  const wipro = insertedCompanies.find(c => c.name === "Wipro")!.id;
  const capgemini = insertedCompanies.find(c => c.name === "Capgemini")!.id;

  const insertedJobs = await db.insert(jobsTable).values([
    { title: "Software Engineer", companyId: googleId, description: "Build scalable software systems", eligibleBranches: "CSE", minCgpa: 7.5, packageLpa: 28.0, deadline: "2025-12-01", status: "open" },
    { title: "Data Analyst", companyId: deloitteId, description: "Analyze business data and create reports", eligibleBranches: "CSE,ECE", minCgpa: 6.5, packageLpa: 8.0, deadline: "2025-11-25", status: "open" },
    { title: "Management Trainee", companyId: tcsId, description: "Rotational training across business units", eligibleBranches: "CSE,ECE,MECH,MBA", minCgpa: 6.0, packageLpa: 4.5, deadline: "2025-11-15", status: "closed" },
    { title: "SDE I", companyId: amazonId, description: "Develop and maintain distributed systems", eligibleBranches: "CSE,ECE", minCgpa: 7.0, packageLpa: 18.0, deadline: "2025-12-10", status: "open" },
    { title: "Program Manager", companyId: microsoftId, description: "Lead product development initiatives", eligibleBranches: "MBA,CSE", minCgpa: 7.0, packageLpa: 24.0, deadline: "2025-11-30", status: "open" },
    { title: "Associate Engineer", companyId: wipro, description: "Entry-level software development role", eligibleBranches: "CSE,ECE,EEE", minCgpa: 6.0, packageLpa: 3.8, deadline: "2025-12-15", status: "open" },
    { title: "IT Analyst", companyId: capgemini, description: "Application maintenance and client support", eligibleBranches: "CSE,ECE,MECH", minCgpa: 6.0, packageLpa: 4.2, deadline: "2025-12-20", status: "open" },
  ]).returning();

  // add sample applications
  const s1 = insertedStudents[0].id; // Aarav CSE 9.2
  const s2 = insertedStudents[1].id; // Ishita ECE 8.8
  const s5 = insertedStudents[4].id; // Vikram CSE 6.8
  const j1 = insertedJobs[0].id; // Google SWE
  const j4 = insertedJobs[3].id; // Amazon SDE I
  const j6 = insertedJobs[5].id; // Wipro AE

  await db.insert(applicationsTable).values([
    { studentId: s1, jobId: j1, status: "offered" },
    { studentId: s1, jobId: j4, status: "interviewed" },
    { studentId: s2, jobId: j4, status: "screened" },
    { studentId: s5, jobId: j6, status: "applied" },
  ]);

  res.json({ message: "Database seeded successfully", counts: { companies: 10, students: 15, jobs: 7, applications: 4 } });
});

export default router;
