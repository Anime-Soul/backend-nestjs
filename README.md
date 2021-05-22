## update nestjs

```bash
nest update -f -t latest
```


```ts
// https://stackoverflow.com/questions/59645009/how-to-return-only-some-columns-of-a-relations-with-typeorm

const { sum, count } = await this.AppraisalRepository.createQueryBuilder('a')
  .where('bindPostId = :id', { id })
  .select('SUM(a.rate)', 'sum')
  .addSelect('COUNT(a.id)', 'count')
  .getRawOne<{ sum: string; count: string }>();

await rep
  .select(['p', 'u', 't', 'c', 'a.rate'])
  .leftJoin('p.creator', 'u')
  .leftJoin('p.categories', 'c')
  .leftJoin('p.tags', 't')
  .leftJoin('p.appraisals', 'a') //TODO: 只查询 rate 字段
  .loadRelationCountAndMap('p.commentCount', 'p.comments', 'cm')
  .skip(offset * limit)
  .take(limit)
  .orderBy('p.createdAt', 'DESC')
  .getMany();

```
