// backend/controllers/courseController.js
const { db } = require('../app');

exports.getAllCourses = (req, res) => {
  const query = `
    SELECT courses.*, categories.name as category_name 
    FROM courses 
    JOIN categories ON courses.category_id = categories.id
  `;
  
  db.all(query, [], (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Could not retrieve courses', details: err });
    }
    res.json(courses);
  });
};

exports.getCourseById = (req, res) => {
  const query = `
    SELECT courses.*, categories.name as category_name 
    FROM courses 
    JOIN categories ON courses.category_id = categories.id
    WHERE courses.id = ?
  `;
  
  db.get(query, [req.params.id], (err, course) => {
    if (err) {
      return res.status(500).json({ error: 'Could not retrieve course', details: err });
    }
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  });
};

exports.createCourse = (req, res) => {
  const { title, category_id, description, start_date, end_date, capacity } = req.body;
  
  const query = `
    INSERT INTO courses (title, category_id, description, start_date, end_date, capacity) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [title, category_id, description, start_date, end_date, capacity], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Could not create course', details: err });
    }
    
    res.status(201).json({ 
      message: 'Course created successfully', 
      courseId: this.lastID 
    });
  });
};

exports.updateCourse = (req, res) => {
  const { title, category_id, description, start_date, end_date, capacity } = req.body;
  const courseId = req.params.id;
  
  const query = `
    UPDATE courses 
    SET title = ?, category_id = ?, description = ?, 
        start_date = ?, end_date = ?, capacity = ?
    WHERE id = ?
  `;
  
  db.run(query, [title, category_id, description, start_date, end_date, capacity, courseId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not update course', details: err });
    }
    
    res.json({ message: 'Course updated successfully' });
  });
};

exports.deleteCourse = (req, res) => {
  const courseId = req.params.id;
  
  const query = 'DELETE FROM courses WHERE id = ?';
  
  db.run(query, [courseId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not delete course', details: err });
    }
    
    res.json({ message: 'Course deleted successfully' });
  });
};