const express = require("express");
const { User, Student, Course, Enrollment } = require("./model");

const router = express.Router();

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
  const student = await Student.create(req.body);
  return res.status(201).json(student);
});

router.get("/students", async (_req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  return res.status(200).json(students);
});

router.get("/students/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ message: "student not found" });
  }
  return res.status(200).json(student);
});

router.put("/students/:id", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
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

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    semester,
  });

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("student", "name email department semester")
    .populate("course", "code title department credits");

  return res.status(201).json(populatedEnrollment);
});

router.get("/enrollments", async (_req, res) => {
  const enrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .populate("student", "name email department semester")
    .populate("course", "code title department credits");
  return res.status(200).json(enrollments);
});

module.exports = router;
