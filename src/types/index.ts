export type REVAIResponse = {
  ingestion_url: string;
  stream_name: string;
  read_url: string;
};

export type CreateRoomResponse = {
  message: string;
  data: {
    roomId: string;
    meetingLink: string;
  };
};

export type Huddle01Response = {
  accessToken: string;
  roomId: string;
};
