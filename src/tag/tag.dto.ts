export class CreateTagArgs {
  name: string;

  description?: string;
}

export class EditTagArgs extends CreateTagArgs {
  id: string;
}

export class DelTagArgs {
  tagId: string;

  postId: string;
}
