require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'john2@arbuckle.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('POST should create a new task', async () => {

      const newTask = {
        todo: 'download',
        completed: false,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .post('/api/to-dos')
        .set('Authorization', token)
        .send(newTask)
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(data.body.todo).toEqual(newTask.todo);
      expect(data.body.id).toBeGreaterThan(0);
    });

    test('GET returns toDos', async ()=> {

      const expectation = ['download'];
      const expectedShape =   {
        id: 4,
        todo: 'download',
        completed: false,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .get('/api/to-dos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const to_do_results = data.body.map(to_do_list => to_do_list.todo);
      
      expect(to_do_results).toEqual(expectation);
      expect(data.body[0]).toEqual(expectedShape);
    }, 10000);


    test('PUT updates todo to completed', async () => {

      const updatedData = {
        todo: 'wires',
        completed: true,
        user_id: 1
      };
      
      const data = await fakeRequest(app)
        .put('/api/to-dos/1')
        .set('Authorization', token)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body.completed).toEqual(updatedData.completed);
    });
  });
});
