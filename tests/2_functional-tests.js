const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let test_id;

suite('Functional Tests', () => {
  suite('Integration tests with chai-http', () => {

    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/http_test')
        .send({
          issue_title: 'Test POST Request',
          issue_text: 'Test POST with full body',
          created_by: 'Tim',
          assigned_to: 'Aimi',
          status_text: 'Pending',
        })
        .end((err, res) => {
          test_id = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test POST Request');
          assert.equal(res.body.issue_text, 'Test POST with full body');
          assert.equal(res.body.created_by, 'Tim');
          assert.equal(res.body.assigned_to, 'Aimi');
          assert.equal(res.body.status_text, 'Pending');
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/http_test')
        .send({
          issue_title: 'Test POST Request 2',
          issue_text: 'Test POST with required only',
          created_by: 'Tim'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test POST Request 2');
          assert.equal(res.body.issue_text, 'Test POST with required only');
          assert.equal(res.body.created_by, 'Tim');
          done();
        });
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/http_test')
        .send({
          created_by: 'Tim'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing' )
          done();
        });
    });

    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/http_test')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 2);
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/http_test?assigned_to=Aimi')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1);
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/http_test?assigned_to=Aimi&status_text=Pending')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1);
          done();
        });
    });

    test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/http_test')
        .send({
          _id: test_id,
          issue_text: 'Used PUT to update one field'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, test_id);
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/http_test')
        .send({
          _id: test_id,
          issue_text: 'Used PUT to update multiple fields',
          status_text: 'UPDATED'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, test_id);
          done();
        }); 
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/http_test')
        .send({
          issue_text: 'Failed PUT request'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/http_test')
        .send({
          _id: test_id
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/http_test')
        .send({
          _id: 'invalid',
          issue_text: 'invalid PUT request'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });

    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/http_test')
        .send({
          _id: test_id
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, test_id);
          done();
        });
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/http_test')
        .send({
          _id: 'invalid'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalid');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/http_test')
        .end((err, res) => {
          console.log(res.body)
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

  })
});
