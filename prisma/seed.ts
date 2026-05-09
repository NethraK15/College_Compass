import { PrismaClient, ExamType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.savedComparison.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.eligibilityRule.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  const userPassword = await bcrypt.hash("Password@123", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      passwordHash: userPassword
    }
  });

  const colleges = await prisma.$transaction([
    prisma.college.create({
      data: {
        name: "Indian Institute of Technology Delhi",
        location: "Delhi",
        fees: 245000,
        rating: 4.8,
        overview: "Premier engineering institute with strong research, startup ecosystem, and global academic collaborations.",
        placementRate: 96,
        averageSalaryLpa: 24,
        establishedYear: 1961,
        courses: {
          create: [
            { name: "B.Tech Computer Science", duration: "4 years", seats: 120 },
            { name: "B.Tech Electrical Engineering", duration: "4 years", seats: 100 },
            { name: "M.Tech AI", duration: "2 years", seats: 40 }
          ]
        },
        reviews: {
          create: [
            { student: "Rohan", rating: 4.9, comment: "Excellent faculty and placements." },
            { student: "Priya", rating: 4.7, comment: "Great campus and research opportunities." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 95, averageSalaryLpa: 23.5, highestSalaryLpa: 80 },
            { year: 2024, placementRate: 96, averageSalaryLpa: 24, highestSalaryLpa: 86 }
          ]
        },
        eligibilityRules: {
          create: [
            { exam: ExamType.JEE, minRank: 1, maxRank: 5000 },
            { exam: ExamType.CAT, minRank: 1, maxRank: 2500 }
          ]
        }
      }
    }),
    prisma.college.create({
      data: {
        name: "All India Institute of Medical Sciences Delhi",
        location: "Delhi",
        fees: 85000,
        rating: 4.9,
        overview: "Top-ranked medical institution known for clinical excellence, medical research, and patient care.",
        placementRate: 98,
        averageSalaryLpa: 18,
        establishedYear: 1956,
        courses: {
          create: [
            { name: "MBBS", duration: "5.5 years", seats: 125 },
            { name: "MD General Medicine", duration: "3 years", seats: 45 },
            { name: "B.Sc Nursing", duration: "4 years", seats: 60 }
          ]
        },
        reviews: {
          create: [
            { student: "Sneha", rating: 4.9, comment: "Best exposure for clinical practice." },
            { student: "Aditya", rating: 4.8, comment: "Competitive but deeply rewarding." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 97, averageSalaryLpa: 17.2, highestSalaryLpa: 40 },
            { year: 2024, placementRate: 98, averageSalaryLpa: 18, highestSalaryLpa: 42 }
          ]
        },
        eligibilityRules: {
          create: [{ exam: ExamType.NEET, minRank: 1, maxRank: 2000 }]
        }
      }
    }),
    prisma.college.create({
      data: {
        name: "National Institute of Technology Trichy",
        location: "Tamil Nadu",
        fees: 195000,
        rating: 4.6,
        overview: "Leading NIT with strong alumni network, robust placements, and balanced campus life.",
        placementRate: 92,
        averageSalaryLpa: 15,
        establishedYear: 1964,
        courses: {
          create: [
            { name: "B.Tech Mechanical Engineering", duration: "4 years", seats: 110 },
            { name: "B.Tech Information Technology", duration: "4 years", seats: 100 },
            { name: "MCA", duration: "2 years", seats: 60 }
          ]
        },
        reviews: {
          create: [
            { student: "Karthik", rating: 4.5, comment: "Strong academics and clubs." },
            { student: "Meera", rating: 4.6, comment: "Great placement support." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 91, averageSalaryLpa: 14.4, highestSalaryLpa: 52 },
            { year: 2024, placementRate: 92, averageSalaryLpa: 15, highestSalaryLpa: 58 }
          ]
        },
        eligibilityRules: {
          create: [{ exam: ExamType.JEE, minRank: 2000, maxRank: 20000 }]
        }
      }
    }),
    prisma.college.create({
      data: {
        name: "Delhi Technological University",
        location: "Delhi",
        fees: 180000,
        rating: 4.4,
        overview: "Highly regarded engineering university with city-industry integration and active technical societies.",
        placementRate: 89,
        averageSalaryLpa: 12,
        establishedYear: 1941,
        courses: {
          create: [
            { name: "B.Tech Software Engineering", duration: "4 years", seats: 95 },
            { name: "BBA", duration: "3 years", seats: 80 },
            { name: "MBA", duration: "2 years", seats: 120 }
          ]
        },
        reviews: {
          create: [
            { student: "Ishita", rating: 4.4, comment: "Good ROI and city opportunities." },
            { student: "Nikhil", rating: 4.3, comment: "Strong coding culture." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 88, averageSalaryLpa: 11.2, highestSalaryLpa: 48 },
            { year: 2024, placementRate: 89, averageSalaryLpa: 12, highestSalaryLpa: 50 }
          ]
        },
        eligibilityRules: {
          create: [
            { exam: ExamType.JEE, minRank: 5000, maxRank: 35000 },
            { exam: ExamType.CAT, minRank: 3000, maxRank: 20000 }
          ]
        }
      }
    }),
    prisma.college.create({
      data: {
        name: "Manipal Institute of Technology",
        location: "Karnataka",
        fees: 320000,
        rating: 4.2,
        overview: "Private engineering college with global tie-ups, innovation labs, and broad specializations.",
        placementRate: 85,
        averageSalaryLpa: 10,
        establishedYear: 1957,
        courses: {
          create: [
            { name: "B.Tech Data Science", duration: "4 years", seats: 90 },
            { name: "B.Tech Civil Engineering", duration: "4 years", seats: 80 },
            { name: "M.Tech Cyber Security", duration: "2 years", seats: 35 }
          ]
        },
        reviews: {
          create: [
            { student: "Laksh", rating: 4.2, comment: "Modern labs and facilities." },
            { student: "Ananya", rating: 4.1, comment: "Vibrant college life and alumni support." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 84, averageSalaryLpa: 9.5, highestSalaryLpa: 35 },
            { year: 2024, placementRate: 85, averageSalaryLpa: 10, highestSalaryLpa: 37 }
          ]
        },
        eligibilityRules: {
          create: [{ exam: ExamType.JEE, minRank: 15000, maxRank: 70000 }]
        }
      }
    }),
    prisma.college.create({
      data: {
        name: "Christian Medical College Vellore",
        location: "Tamil Nadu",
        fees: 120000,
        rating: 4.7,
        overview: "Top medical college recognized for healthcare training, ethics, and public health programs.",
        placementRate: 95,
        averageSalaryLpa: 14,
        establishedYear: 1900,
        courses: {
          create: [
            { name: "MBBS", duration: "5.5 years", seats: 100 },
            { name: "BPT", duration: "4.5 years", seats: 60 },
            { name: "M.Sc Nursing", duration: "2 years", seats: 40 }
          ]
        },
        reviews: {
          create: [
            { student: "Ritika", rating: 4.8, comment: "Strong clinical rigour and mentorship." },
            { student: "Farhan", rating: 4.6, comment: "Excellent patient diversity exposure." }
          ]
        },
        placements: {
          create: [
            { year: 2023, placementRate: 94, averageSalaryLpa: 13.2, highestSalaryLpa: 28 },
            { year: 2024, placementRate: 95, averageSalaryLpa: 14, highestSalaryLpa: 30 }
          ]
        },
        eligibilityRules: {
          create: [{ exam: ExamType.NEET, minRank: 1500, maxRank: 12000 }]
        }
      }
    })
  ]);

  const firstCollege = colleges[0];
  const secondCollege = colleges[1];

  await prisma.savedCollege.createMany({
    data: [
      { userId: demoUser.id, collegeId: firstCollege.id },
      { userId: demoUser.id, collegeId: secondCollege.id }
    ]
  });

  await prisma.savedComparison.create({
    data: {
      userId: demoUser.id,
      name: "Engineering vs Medical Top Picks",
      collegeIds: [firstCollege.id, secondCollege.id]
    }
  });

  const question = await prisma.question.create({
    data: {
      userId: demoUser.id,
      title: "How important is placement rate vs fees?",
      body: "I am deciding between a high-fee private college and a lower-fee public college. What should I prioritize?"
    }
  });

  await prisma.answer.createMany({
    data: [
      {
        questionId: question.id,
        userId: demoUser.id,
        body: "Compare total ROI over 4 years and check median package, not just highest package."
      },
      {
        questionId: question.id,
        userId: demoUser.id,
        body: "Also evaluate alumni network, internships, and your own branch preference."
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
