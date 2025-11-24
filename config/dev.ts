const commons = {
  env: {
    account: '442867850698',
    region: 'ap-southeast-1',
  },
  stage: 'dev',
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
