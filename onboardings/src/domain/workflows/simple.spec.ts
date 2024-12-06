// import { TestWorkflowEnvironment } from '@temporalio/testing';
// import { before, describe, it } from 'mocha';
// import { Worker } from '@temporalio/worker';
// const { expect, assert } =require('chai')
//
// describe('OnboardEntity', async () => {
//
//   describe('when invoked with invalid args', async () => {
//     let testEnv: TestWorkflowEnvironment;
//
//     before(async () => {
//
//       testEnv = await TestWorkflowEnvironment.createLocal();
//     });
//
//     after(async () => {
//
//       await testEnv?.teardown();
//     });
//     it('should be kind to mike', async () => {
//       // const { client, nativeConnection } = testEnv;
//       // const taskQueue = 'test';
//       //
//       // const worker = await Worker.create({
//       //   connection: nativeConnection,
//       //   taskQueue,
//       //   workflowsPath: require.resolve('./onboard-entity'),
//       //   // activities,
//       // });
//       // await worker.run()
//       expect(42).to.eq(42)
//       // worker.shutdown()
//       // await nativeConnection.close()
//     })
//
//   })
// })