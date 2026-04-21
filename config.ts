export type CycloneMode = 'development' | 'production' | 'test';

export type CycloneConfig = {
  version: string;
  license: string;
  mode: CycloneMode;
  hotel: Hotel;
  server: Server;
  database: Database;
};

export type Database = {
  type: 'mysql' | 'postgresql' | 'sqlite' | string;
  host: string;
  port: number;
  name: string;
  user: string;
  pass: string;
};

export type Hotel = {
  name: string;
  theme: string;
  maintenance: boolean;
  currencies: string[];
  url: string[];
  user: User;
  registration: Registration;
};

export type Registration = {
  rank: number;
  room: number;
  vip: number;
  motto: string;
  currencies: Currency[];
};

export type Currency = {
  name: string;
  amount: number;
};

export type User = {
  maxFriends: number;
  maxClubFriends: number;
};

export type Server = {
  host: string;
  port: number;
};

const CycloneConfigDefault: CycloneConfig = {
  version: '1.0.0',
  license: 'UNLICENSED',
  mode: 'development',
  hotel: {
    name: 'EtherWorld',
    theme: 'default',
    maintenance: false,
    currencies: ['credits', 'duckets', 'diamonds'],
    url: ['http://localhost:3000'],
    user: {
      maxFriends: 300,
      maxClubFriends: 1000,
    },
    registration: {
      rank: 1,
      room: 1,
      vip: 0,
      motto: 'Bienvenue sur EtherWorld',
      currencies: [
        { name: 'credits', amount: 500 },
        { name: 'duckets', amount: 250 },
      ],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  database: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    name: 'etherworld',
    user: 'root',
    pass: '',
  },
};

export default CycloneConfigDefault;
