export type ILoginUser = {
  username: string;
  password: string;
};

export type ILoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
};

export type IRefreshTokenResponse = {
  accessToken: string;
};
