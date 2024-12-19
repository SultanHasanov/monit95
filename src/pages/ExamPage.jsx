import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, message, Collapse, Upload, Switch } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const ExamPage = () => {
  const [students, setStudents] = useState([]);
  const [examName, setExamName] = useState("");
  const [scoreFields, setScoreFields] = useState(0);
  const [results, setResults] = useState([]);
  const [savedExams, setSavedExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const navigate = useNavigate(); 

  // Получение списка учеников
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "https://439aacc68c917992.mokky.dev/students"
      );
      setStudents(
        response.data.map((student) => ({
          id: student.id,
          fullName: `${student.firstName} ${student.lastName} ${student.middleName}`,
          className: student.className,
        }))
      );
    } catch (error) {
      console.error("Ошибка при загрузке списка учеников:", error);
      message.error("Не удалось загрузить список учеников.");
    }
  };

  // Получение сохранённых экзаменов
  const fetchSavedExams = async () => {
    try {
      const response = await axios.get(
        "https://439aacc68c917992.mokky.dev/results"
      );
      setSavedExams(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке экзаменов:", error);
      message.error("Не удалось загрузить сохранённые экзамены.");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSavedExams();
  }, []);

  // Создание экзамена
  const handleCreateExam = () => {
    if (!examName || scoreFields <= 0) {
      message.error(
        "Введите название экзамена и количество баллов больше нуля."
      );
      return;
    }
    const initialResults = students.map((student) => ({
      studentId: student.id,
      fullName: student.fullName,
      className: student.className,
      scores: Array(scoreFields).fill(0),
      isAbsent: false,
    }));
    setResults(initialResults);
    message.success(
      "Экзамен создан! Нажмите на кнопку для скачивания шаблона."
    );
  };

  // Генерация Excel-шаблона
  const generateExcelTemplate = () => {
    if (!results.length) {
      message.error("Сначала создайте экзамен!");
      return;
    }

    const data = results.map((result) => ({
      ФИО: result.fullName,
      Класс: result.className,
      Отсутствовал: result.isAbsent ? "Да" : "Нет",
      ...Object.fromEntries(
        result.scores.map((_, index) => [`Балл ${index + 1}`, ""])
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Экзамен");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([excelBuffer]), `${examName}_шаблон.xlsx`);
    message.success("Шаблон успешно скачан!");
  };

  // Загрузка Excel-файла
  const handleFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const updatedResults = data.map((row) => ({
        studentId: students.find((student) => student.fullName === row["ФИО"])
          ?.id,
        fullName: row["ФИО"],
        className: row["Класс"],
        isAbsent: row["Отсутствовал"] === "Да",
        scores: Array(scoreFields)
          .fill(0)
          .map((_, index) => Number(row[`Балл ${index + 1}`] || 0)),
      }));

      setResults(updatedResults);
      message.success("Файл успешно загружен!");
    };
    reader.readAsBinaryString(file);
  };

  // Сохранение результатов
  const handleSaveResults = async () => {
    if (!examName || results.length === 0) {
      message.error("Введите название экзамена и заполните результаты.");
      return;
    }
    try {
      setLoading(true);
      const payload = { examName, results };
      await axios.post("https://439aacc68c917992.mokky.dev/results", payload);
      message.success("Результаты успешно сохранены!");
      fetchSavedExams();
      setResults([]);
      setExamName("");
      setScoreFields(0);
    } catch (error) {
      console.error("Ошибка при сохранении результатов:", error);
      message.error("Не удалось сохранить результаты.");
    } finally {
      setLoading(false);
    }
  };

  // Редактирование сохранённого экзамена
  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setResults(exam.results);
    setExamName(exam.examName);
    setScoreFields(exam.results[0]?.scores.length || 0);
  };

  // Обновление сохранённого экзамена
  const handleUpdateExam = async () => {
    if (!editingExam) return;
    try {
      setLoading(true);
      const payload = {
        examName: editingExam.examName,
        results,
      };
      await axios.patch(
        `https://439aacc68c917992.mokky.dev/results/${editingExam.id}`,
        payload
      );
      message.success("Экзамен успешно обновлён!");
      fetchSavedExams();
      setEditingExam(null);
      setResults([]);
    } catch (error) {
      console.error("Ошибка при обновлении экзамена:", error);
      message.error("Не удалось обновить экзамен.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = (checked, examId) => {
    setEditingExamId(checked ? examId : null);
    setIsEditingEnabled(checked);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button onClick={() => navigate(-1)}> <ArrowLeftOutlined /> Назад</Button>
      <h1>Управление экзаменами</h1>

      {/* Форма создания экзамена */}
      {!editingExam && (
        <Form layout="vertical" style={{ marginBottom: "20px" }}>
          <Form.Item label="Название экзамена" required>
            <Input
              placeholder="Введите название экзамена"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Количество полей для баллов" required>
            <Input
              type="number"
              placeholder="Введите количество баллов"
              value={scoreFields}
              onChange={(e) => setScoreFields(Number(e.target.value))}
            />
          </Form.Item>
          <Button type="primary" onClick={handleCreateExam}>
            Создать экзамен
          </Button>
        </Form>
      )}

      {/* Кнопка скачивания Excel-шаблона */}
      {results.length > 0 && (
        <Button
          type="default"
          onClick={generateExcelTemplate}
          style={{ marginBottom: "20px" }}
        >
          Скачать шаблон
        </Button>
      )}

      {/* Загрузка Excel-файла */}
      <Upload
        beforeUpload={(file) => {
          handleFileUpload(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button>Загрузить Excel-файл</Button>
      </Upload>

      {/* Таблица ввода баллов */}
      {results.length > 0 && (
        <Table
          dataSource={results}
          columns={[
            {
              title: "ФИО",
              dataIndex: "fullName",
            },
            {
              title: "Класс",
              dataIndex: "className",
            },
            {
              title: "Отсутствие",
              render: (_, record) => (
                <Button
                  type="danger"
                  onClick={() =>
                    setResults((prev) =>
                      prev.map((r) =>
                        r.studentId === record.studentId
                          ? { ...r, isAbsent: !r.isAbsent }
                          : r
                      )
                    )
                  }
                >
                  {record.isAbsent ? "Присутствовал" : "Н"}
                </Button>
              ),
            },
            ...Array.from({ length: scoreFields }, (_, index) => ({
              title: `Балл ${index + 1}`,
              render: (_, record) => (
                <Input
                  type="number"
                  disabled={record.isAbsent}
                  value={record.scores[index]}
                  onChange={(e) =>
                    setResults((prev) =>
                      prev.map((r) =>
                        r.studentId === record.studentId
                          ? {
                              ...r,
                              scores: r.scores.map((score, i) =>
                                i === index ? Number(e.target.value) : score
                              ),
                            }
                          : r
                      )
                    )
                  }
                />
              ),
            })),
          ]}
          rowKey="studentId"
        />
      )}

      {/* Кнопка сохранения */}
      <Button
        type="primary"
        onClick={editingExam ? handleUpdateExam : handleSaveResults}
        loading={loading}
        style={{ marginTop: "20px" }}
      >
        {editingExam ? "Обновить экзамен" : "Сохранить результаты"}
      </Button>

      {/* Список сохранённых экзаменов */}
      <h2>Сохранённые экзамены</h2>
      <Collapse>
        {savedExams.map((exam) => (
          <Panel
            header={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{exam.examName}</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Switch
                    checked={editingExamId === exam.id}
                    onChange={(checked) => handleToggleEdit(checked, exam.id)}
                  />
                  <Button
                  disabled={!isEditingEnabled || editingExamId !== exam.id}
              type="link"
              onClick={() => handleEditExam(exam)}
            >
              Редактировать
            </Button>
                </div>
              </div>
            }
            key={exam.id}
          >
            
            {exam.results.map((result, index) => (
              <div key={index}>
                <strong>{result.fullName}</strong> ({result.className}):{" "}
                {result.isAbsent ? "Отсутствовал" : result.scores.join(", ")}
              </div>
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ExamPage;
