const express = require("express");
const { randomInt } = require("crypto");
const { User, Student, Course, Enrollment } = require("./model");

const router = express.Router();
const STUDENT_UNIQUE_ID_MIN = 100000000000;
const STUDENT_UNIQUE_ID_MAX = 1000000000000;
const STUDENT_UNIQUE_ID_MAX_ATTEMPTS = 10;
const ENROLLMENT_NUMBER_MIN = 100000000000;
const ENROLLMENT_NUMBER_MAX = 1000000000000;
const ENROLLMENT_NUMBER_MAX_ATTEMPTS = 10;

function generateStudentUniqueId() {
  return String(randomInt(STUDENT_UNIQUE_ID_MIN, STUDENT_UNIQUE_ID_MAX));
}

function generateEnrollmentNumber() {
  return String(randomInt(ENROLLMENT_NUMBER_MIN, ENROLLMENT_NUMBER_MAX));
}

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "email already exists" });
  }

  await User.create({ email, password });

  return res.status(201).json({ message: "user registered successfully" });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  return res.status(200).json({ message: "login success", email: user.email });
});

router.post("/students", async (req, res) => {
  const { studentUniqueId: requestedStudentUniqueId, ...studentPayload } = req.body;
  let student = null;

  for (let attempt = 0; attempt < STUDENT_UNIQUE_ID_MAX_ATTEMPTS; attempt += 1) {
    const studentUniqueId =
      attempt === 0 && requestedStudentUniqueId
        ? requestedStudentUniqueId
        : generateStudentUniqueId();
    try {
      student = await Student.create({
        ...studentPayload,
        studentUniqueId,
      });
      break;
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.studentUniqueId) {
        continue;
      }
      throw error;
    }
  }

  if (!student) {
    return res.status(500).json({ message: "failed to generate unique student id" });
  }

  return res.status(201).json(student);
});

router.get("/students", async (_req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  return res.status(200).json(students);
});

router.get("/students/next-unique-id", async (_req, res) => {
  for (let attempt = 0; attempt < STUDENT_UNIQUE_ID_MAX_ATTEMPTS; attempt += 1) {
    const studentUniqueId = generateStudentUniqueId();
    const existingStudent = await Student.findOne({ studentUniqueId }).select("_id");
    if (!existingStudent) {
      return res.status(200).json({ studentUniqueId });
    }
  }

  return res.status(500).json({ message: "failed to generate unique student id" });
});

router.get("/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ message: "student not found" });
  }
  return res.status(200).json(student);
});

router.put("/students/:id", async (req, res) => {
  const { studentUniqueId, ...updatablePayload } = req.body;
  const student = await Student.findByIdAndUpdate(req.params.id, updatablePayload, {
    new: true,
    runValidators: true,
  });
  if (!student) {
    return res.status(404).json({ message: "student not found" });
  }
  return res.status(200).json(student);
});

router.delete("/students/:id", async (req, res) => {
  const deleted = await Student.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "student not found" });
  }
  return res.status(200).json({ message: "student deleted" });
});

router.post("/courses", async (req, res) => {
  const course = await Course.create(req.body);
  return res.status(201).json(course);
});

router.get("/courses", async (_req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  return res.status(200).json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "course not found" });
  }
  return res.status(200).json(course);
});

router.put("/courses/:id", async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    return res.status(404).json({ message: "course not found" });
  }
  return res.status(200).json(course);
});

router.delete("/courses/:id", async (req, res) => {
  const deleted = await Course.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "course not found" });
  }
  return res.status(200).json({ message: "course deleted" });
});

router.post("/enrollments", async (req, res) => {
  const { studentId, courseId, semester } = req.body;
  if (!studentId || !courseId || !semester) {
    return res
      .status(400)
      .json({ message: "studentId, courseId and semester are required" });
  }

  const [student, course] = await Promise.all([
    Student.findById(studentId),
    Course.findById(courseId),
  ]);

  if (!student) {
    return res.status(404).json({ message: "student not found" });
  }
  if (!course) {
    return res.status(404).json({ message: "course not found" });
  }

  let enrollment = null;
  for (let attempt = 0; attempt < ENROLLMENT_NUMBER_MAX_ATTEMPTS; attempt += 1) {
    try {
      enrollment = await Enrollment.create({
        enrollmentNumber: generateEnrollmentNumber(),
        student: studentId,
        course: courseId,
        semester,
      });
      break;
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.enrollmentNumber) {
        continue;
      }
      throw error;
    }
  }

  if (!enrollment) {
    return res.status(500).json({ message: "failed to generate unique enrollment number" });
  }

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("student", "studentUniqueId name email department semester")
    .populate("course", "code title department credits");

  return res.status(201).json(populatedEnrollment);
});

router.get("/enrollments", async (_req, res) => {
  const enrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .populate("student", "studentUniqueId name email department semester")
    .populate("course", "code title department credits");
  return res.status(200).json(enrollments);
});

module.exports = router;
