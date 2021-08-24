require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const toDoData = require('../data/to-dos.js');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('GET returns toDos', async ()=> {

      const expectation = toDoData.map(to_do_list => to_do_list.todo);
      const expectedShape =   {
        id: 1,
        todo: 'wires',
        completed: false,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .get('/to-dos')
        .expect('Content-Type', /json/)
        .expect(200);

      const to_do_results = data.body.map(to_do_list => to_do_list.todo);
      
      expect(to_do_results).toEqual(expectation);
      expect(to_do_results.length).toEqual(toDoData.length);
      expect(data.body[0]).toEqual(expectedShape);
    }, 10000);

    test('POST should create a new task', async () => {

      const newTask = {
        todo: 'download',
        completed: false,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .post('/to-dos')
        .send(newTask)
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(data.body.todo).toEqual(newTask.todo);
      expect(data.body.id).toBeGreaterThan(0);
    });

    test('PUT updates todo to completed', async () => {

      const updatedData = {
        todo: 'wires',
        completed: true,
        user_id: 1
      };
      
      const data = await fakeRequest(app)
        .put('/to-dos/1')
        .send(updatedData);
        // .expect(200)
        // .expect('Content-Type', /json/);

      expect(data.body.completed).toEqual(updatedData.completed);
    });
  });
});