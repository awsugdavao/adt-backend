const commons = {
  projectName: 'adt',
  env: {
    account: '442867850698',
    region: 'ap-southeast-1',
  },
  stage: 'dev',
  fromEmail: 'dev@awsugdavao.ph',
  fromName: 'Dev AWS User Group Davao',
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
