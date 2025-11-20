const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// مساعدة قراءة ملف json بأمان
function readStories() {
  const file = path.join(__dirname, "data", "stories.json");
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(txt);
  } catch (e) {
    return [];
  }
}

// جلب كل القصص
app.get("/stories", (req, res) => {
  const stories = readStories();
  res.json(stories);
});

// جلب قصة واحدة حسب ID
app.get("/story/:id", (req, res) => {
  const stories = readStories();
  const id = parseInt(req.params.id);
  const story = stories.find(s => s.id === id);
  if (!story) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(story);
});

// حفظ قصة جديدة من الادمن
app.post("/saveStory", (req, res) => {
  const stories = readStories();
  const story = req.body;

  // إذا ما فيه id أعطي id جديد
  if (!story.id) {
    const maxId = stories.reduce((m, s) => Math.max(m, s.id || 0), 0);
    story.id = maxId + 1;
  }

  stories.push(story);

  const file = path.join(__dirname, "data", "stories.json");
  fs.writeFileSync(file, JSON.stringify(stories, null, 2), "utf8");

  res.json({ success: true, id: story.id });
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});
