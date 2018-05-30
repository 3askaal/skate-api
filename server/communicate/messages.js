const MESSAGES = {};

const PUSH = {
  'game:remove': {
    notification: {
      title: 'Game removal request',
      body: '{{sender}} requested to remove a game',
    },
    data: {
      redirect: 'mates',
    },
  },
  'game:invite': {
    notification: {
      title: 'Game invite!',
      body: '{{sender}} invited you for a Game of s.k.a.t.e',
    },
    data: {
      lobby: true,
    },
  },
  'mate:request': {
    notification: {
      title: 'Mate request!',
      body: '{{sender}} has sent you a mate request',
    },
    data: {
      redirect: 'mates',
    },
  },
  'mate:accept': {
    notification: {
      title: 'Mate accepted!',
      body: '{{sender}} accepted your mate request',
    },
    data: {
      redirect: 'mates',
    },
  },
};

module.exports = {
  MESSAGES,
  PUSH,
};
