const PRESENTATIONS_BY_COURSE = {
  a1: {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
    15: true,
    16: true,
    17: true,
    18: true,
    19: true,
    20: true,
    21: true,
  },
  a2: {},
  b1: {},
  b2: {},
};

const getPresentationUrl = (course, lessonNumber) => {
  const normalizedCourse = String(course || "").trim().toLowerCase();
  const safeLessonNumber = Number(lessonNumber) || 1;
  const courseMap = PRESENTATIONS_BY_COURSE[normalizedCourse];
  if (courseMap && courseMap[safeLessonNumber]) {
    return `presentation.html?course=${encodeURIComponent(normalizedCourse)}&lesson=${safeLessonNumber}`;
  }
  return "";
};
