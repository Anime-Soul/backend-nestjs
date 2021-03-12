export class OptionalVideoField {
  title: string;

  playUrl: string;

  episode?: number;

  subtitle?: string;

  cover?: string;
}

export class CreateVideoArgsWithPost extends OptionalVideoField {
  bindPostId?: string;
}

export class CreateVideoArgs extends OptionalVideoField {
  bindPostId: string;
}

export class EditVideoArgs extends OptionalVideoField {
  id: string;
}
