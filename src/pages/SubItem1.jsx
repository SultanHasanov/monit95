import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Switch, List, message, Popconfirm } from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SubItem1 = () => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDocument, setIsDocument] = useState(true); // Toggle between document or link
  const [editingTask, setEditingTask] = useState(null); // For task editing
  const navigate = useNavigate(); 


  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://439aacc68c917992.mokky.dev/items");
      setTasks(response.data || []);
    } catch (error) {
      console.error("Ошибка при получении задач:", error);
      message.error("Не удалось получить задачи");
    }
  };

  const handleSubmit = async (values) => {
    const { title, document } = values;

    setLoading(true);
    try {
      if (isDocument) {
        // Document upload logic
        if (!document || !document[0] || !document[0].originFileObj) {
          message.error("Пожалуйста, загрузите документ!");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", document[0].originFileObj);

        const uploadResponse = await axios.post("https://439aacc68c917992.mokky.dev/uploads", formData);
        const fileUrl = uploadResponse.data.url;
        const fileId = uploadResponse.data.id;

        if (editingTask) {
          await axios.patch(`https://439aacc68c917992.mokky.dev/items/${editingTask.id}`, {
            title,
            fileUrl,
            fileId,
            isDocument,
          });
          message.success("Задача успешно отредактирована!");
        } else {
          await axios.post("https://439aacc68c917992.mokky.dev/items", {
            title,
            fileUrl,
            fileId,
            isDocument,
            active: true, // New tasks are active by default
          });
          message.success("Задача успешно создана!");
        }
      } else {
        // Add a task linked to /exampage
        if (editingTask) {
          await axios.patch(`https://439aacc68c917992.mokky.dev/items/${editingTask.id}`, {
            title,
            isDocument,
            link: "/exampage",
          });
          message.success("Задача успешно отредактирована!");
        } else {
          await axios.post("https://439aacc68c917992.mokky.dev/items", {
            title,
            isDocument,
            link: "/exampage",
            active: true, // New tasks are active by default
          });
          message.success("Задача успешно создана!");
        }
      }

      fetchTasks();
      form.resetFields();
      setEditingTask(null);
    } catch (error) {
      console.error("Ошибка при создании/редактировании задачи:", error);
      message.error("Не удалось создать или отредактировать задачу");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId, active) => {
    try {
      await axios.patch(`https://439aacc68c917992.mokky.dev/items/${taskId}`, { active });
      message.success(`Задача ${active ? "активирована" : "деактивирована"} успешно!`);
      fetchTasks();
    } catch (error) {
      console.error("Ошибка при переключении состояния задачи:", error);
      message.error("Не удалось переключить состояние задачи");
    }
  };

  const handleDelete = async (taskId, fileId) => {
    try {
      if (fileId) {
        await axios.delete(`https://439aacc68c917992.mokky.dev/uploads/${fileId}`);
        message.success("Документ успешно удален!");
      }
      await axios.delete(`https://439aacc68c917992.mokky.dev/items/${taskId}`);
      message.success("Задача успешно удалена!");
      fetchTasks();
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
      message.error("Не удалось удалить задачу");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsDocument(task.isDocument);
    form.setFieldsValue({ title: task.title });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
        <Button onClick={() => navigate(-1)}> <ArrowLeftOutlined /> Назад</Button>
      <h1>Управление задачами</h1>
      <Link to="/subitem1/students">Управление учениками</Link>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="title" label="Заголовок задачи" rules={[{ required: true, message: "Введите заголовок задачи!" }]}>
          <Input placeholder="Введите заголовок" />
        </Form.Item>

        <Form.Item label="Тип задачи">
          <Switch
            checked={isDocument}
            onChange={setIsDocument}
            checkedChildren="Документ"
            unCheckedChildren="Ссылка"
          />
        </Form.Item>

        {isDocument ? (
          <Form.Item
            name="document"
            label="Документ"
            valuePropName="file"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e.fileList)}
            rules={[{ required: true, message: "Загрузите документ!" }]}
          >
            <Upload name="document" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Загрузить документ</Button>
            </Upload>
          </Form.Item>
        ) : (
          <Form.Item>
            <div>
              Ссылка на страницу: <Link to="/exampage">/exampage</Link>
            </div>
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingTask ? "Редактировать задачу" : "Создать задачу"}
          </Button>
        </Form.Item>
      </Form>

      <h2>Список задач</h2>
      <List
        bordered
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item
            className={task.active ? "" : "task-inactive"} // Grey out inactive tasks
            actions={[
              task.isDocument ? (
                task.active ? (
                  <a key="download" href={task.fileUrl} target="_blank" rel="noopener noreferrer">
                    Скачать документ
                  </a>
                ) : (
                  <span key="download" style={{ color: "gray" }}>Скачать документ</span>
                )
              ) : task.active ? (
                <Link key="results" to="exampage">
                  Перейти к результатам
                </Link>
              ) : (
                <span key="results" style={{ color: "gray" }}>Перейти к результатам</span>
              ),
              <Switch
                key="toggle"
                checked={task.active}
                onChange={(checked) => handleToggle(task.id, checked)}
              />,
              <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(task)} />,
              <Popconfirm
                key="delete"
                title="Вы уверены, что хотите удалить эту задачу?"
                onConfirm={() => handleDelete(task.id, task.fileId)}
                okText="Да"
                cancelText="Нет"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={task.title}
              description={`Тип: ${task.isDocument ? "Документ" : "Ссылка"} | Статус: ${
                task.active ? "Активно" : "Неактивно"
              }`}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default SubItem1;
