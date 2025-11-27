import 'dotenv/config';

const commons = {
  projectName: 'adt',
  env: {
    account: '442867850698',
    region: 'ap-southeast-1',
  },
  stage: process.env.STAGE || 'local',
  fromEmail: process.env.FROM_EMAIL || 'hello@awsugdavao.ph',
  fromName: process.env.FROM_EMAIL_NAME || 'AWS User Group Davao',
};

const Stateful = {
  ...commons,
  env: {
    ...commons.env,
    region: 'ap-southeast-1',
  },
};

const Stateless = {
  ...commons,
  env: {
    ...commons.env,
    region: 'ap-southeast-1',
  },
};

export default { Stateful, Stateless };
