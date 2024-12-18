import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Table, Popconfirm, message } from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx"; // Library for handling Excel files

const StudentManagementPage = () => {
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false); // Track if file is uploaded
  const [uploadedStudents, setUploadedStudents] = useState([]); // Store students from the file

  // Fetch students from the server
  const fetchStudents = async () => {
    try {
      const response = await axios.get("https://439aacc68c917992.mokky.dev/students");
      console.log(response.data); // Для отладки
      setStudents(response.data);
    } catch (error) {
      console.error("Ошибка при получении студентов:", error);
      message.error("Не удалось получить студентов");
    }
  };

  // Handle student form submission (add/edit)
  const handleSubmit = async (values) => {
    const { firstName, lastName, middleName, snils, className } = values;

    setLoading(true);
    try {
      if (editingStudent) {
        // Update existing student
        await axios.patch(`https://439aacc68c917992.mokky.dev/students/${editingStudent.id}`, {
          firstName,
          lastName,
          middleName,
          snils,
          className,
        });
        message.success("Студент успешно отредактирован!");
      } else {
        // Add new student
        await axios.post("https://439aacc68c917992.mokky.dev/students", {
          firstName,
          lastName,
          middleName,
          snils,
          className,
        });
        message.success("Студент успешно добавлен!");
      }

      fetchStudents();
      form.resetFields();
      setEditingStudent(null); // Reset edit state
    } catch (error) {
      console.error("Ошибка при добавлении/редактировании студента:", error);
      message.error("Не удалось добавить или отредактировать студента");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a student
  const handleDelete = async (studentId) => {
    try {
      await axios.delete(`https://439aacc68c917992.mokky.dev/students/${studentId}`);
      message.success("Студент успешно удален!");
      fetchStudents();
    } catch (error) {
      console.error("Ошибка при удалении студента:", error);
      message.error("Не удалось удалить студента");
    }
  };

  // Handle editing a student
  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName,
      snils: student.snils,
      className: student.className,
    });
  };

  // Handle uploading students from an Excel file
  const handleFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const studentsData = XLSX.utils.sheet_to_json(sheet);

      // Преобразуем данные из Excel в нужный формат
      const formattedStudents = studentsData.map(student => ({
        firstName: student.Имя,  // Имя -> firstName
        lastName: student.Фамилия, // Фамилия -> lastName
        middleName: student.Отчество, // Отчество -> middleName
        snils: student.СНИЛС, // СНИЛС -> snils
        className: student.Класс, // Класс -> className
        id: student.id // id оставляем как есть
      }));

      setUploadedStudents(formattedStudents); // Save uploaded students to state
      setFileUploaded(true); // Mark file as uploaded
      message.success("Файл успешно загружен!");
    };
    reader.readAsBinaryString(file);
    return false; // Prevent default upload behavior
  };

  // Handle sending uploaded students to the server
  const handleSendUploadedStudents = async () => {
    setLoading(true);
    try {
      for (const student of uploadedStudents) {
        await axios.post("https://439aacc68c917992.mokky.dev/students", student);
      }
      message.success("Студенты успешно загружены на сервер!");
      fetchStudents(); // After uploading, refresh student list
    } catch (error) {
      console.error("Ошибка при загрузке студентов:", error);
      message.error("Не удалось загрузить студентов на сервер");
    } finally {
      setLoading(false);
      setFileUploaded(false); // Reset after sending
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Управление учениками</h1>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя!" }]}>
          <Input placeholder="Введите имя" />
        </Form.Item>
        <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию!" }]}>
          <Input placeholder="Введите фамилию" />
        </Form.Item>
        <Form.Item name="middleName" label="Отчество">
          <Input placeholder="Введите отчество" />
        </Form.Item>
        <Form.Item name="snils" label="СНИЛС" rules={[{ required: true, message: "Введите СНИЛС!" }]}>
          <Input placeholder="Введите СНИЛС" />
        </Form.Item>
        <Form.Item name="className" label="Класс с литером" rules={[{ required: true, message: "Введите класс с литером!" }]}>
          <Input placeholder="Например, 5А" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingStudent ? "Редактировать ученика" : "Добавить ученика"}
          </Button>
        </Form.Item>
      </Form>

      <h2>Список учеников</h2>
      <Table
        dataSource={students}
        columns={[
          { title: "Фамилия", dataIndex: "lastName" },
          { title: "Имя", dataIndex: "firstName" },
          { title: "Отчество", dataIndex: "middleName" },
          { title: "СНИЛС", dataIndex: "snils" },
          { title: "Класс", dataIndex: "className" },
          {
            title: "Действия",
            render: (_, student) => (
              <>
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(student)} />
                <Popconfirm
                  title="Вы уверены, что хотите удалить этого ученика?"
                  onConfirm={() => handleDelete(student.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </>
            ),
          },
        ]}
        rowKey="id"
      />

      <h3>Загрузить учеников через Excel</h3>
      <Upload beforeUpload={handleFileUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Загрузить файл</Button>
      </Upload>

      {fileUploaded && (
        <Button type="primary" onClick={handleSendUploadedStudents} loading={loading} style={{ marginTop: "20px" }}>
          Отправить загруженных учеников
        </Button>
      )}
    </div>
  );
};

export default StudentManagementPage;
