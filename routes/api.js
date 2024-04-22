'use strict';
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)

const issueSchema = new mongoose.Schema ({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    required: true
  },
  updated_on: {
    type: Date
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
  },
  open: {
    type: Boolean,
    default: true
  },
  status_text: {
    type: String
  },
  project: {
    type: String,
    required: true
  }
});

let Issue = mongoose.model('Issue', issueSchema);

const a = () => {Issue.collection.deleteMany({})};
a();

module.exports = (app) =>  {

  app.route('/api/issues/:project')
    
    .get(async (req, res) => {
      try {
        const project = req.params.project;
        const query = req.query;
        query.project = project
        const issues = await Issue.find(query).select({__v: 0, project: 0});
        res.send(issues);
      }
      catch (err) {
        console.log(err);
      };
    })
    
    .post(function (req, res){
      try {
        const { issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
        const project = req.params.project;

        if ( !issue_title || !issue_text || !created_by) { return res.send({ error: 'required field(s) missing' })};

        const issue = new Issue ({
          issue_title: issue_title,
          issue_text: issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by,
          assigned_to: assigned_to ? assigned_to : '',
          open: true,
          status_text: status_text ? status_text : '',
          project: project
        });

        issue.save();
        res.send(issue);
      }
      catch (err) {
        console.log(err)
      };
    })
    
    .put(async (req, res) => {
      try {
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

        if (!_id) {
          return res.send({ error: 'missing _id' })
        } else if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
          return res.send({ error: 'no update field(s) sent', _id: _id });
        } else {
          const issue = await Issue.findById(_id).select({ __v: 0, project: 0 });
          issue.issue_title = issue_title ? issue_title : issue.issue_title;
          issue.issue_text = issue_text ? issue_text : issue.issue_text;
          issue.created_by = created_by ? created_by : issue.created_by;
          issue.assigned_to = assigned_to ? assigned_to : issue.assigned_to;
          issue.status_text = status_text ? status_text : issue.status_text;
          issue.updated_on = new Date();
          issue.open = open === false ? false : true;

          issue.save();
          res.send({  result: 'successfully updated', _id: _id });
        }
      }
      catch (err) {
        console.log(err);
        res.send({ error: 'could not update', _id: req.body._id });
      }
    })
    
    .delete(async (req, res) => {
      try {
        const id = req.body._id;
        if (!id) {return res.send({ error: 'missing _id' })};
        const issue_to_delete = await Issue.findByIdAndDelete(id);
        if (!issue_to_delete) { return res.send({ error: 'could not delete', _id: req.body._id }) };
        res.send({ result: 'successfully deleted', _id: id });
      }
      catch (err) {
        console.log(err);
        res.send({ error: 'could not delete', _id: req.body._id });
      }
    });
    
};
