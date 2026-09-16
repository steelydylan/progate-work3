const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// やること一覧の取得
app.get("/api/todos", async (req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// やることの追加
app.post("/api/todos", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "やることの内容を入力してください" });
    }
    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
      },
    });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// 完了状態の更新
app.patch("/api/todos/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "無効なIDです" });
    }
    const { completed } = req.body;
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        completed: typeof completed === "boolean" ? completed : undefined,
      },
    });
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// やることの削除
app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "無効なIDです" });
    }
    await prisma.todo.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// エラーハンドリング（エンドポイントは必ずこれより上に追加する）
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "サーバーでエラーが発生しました" });
});

app.listen(3000, () => {
  console.log("API server running at http://localhost:3000/");
});
