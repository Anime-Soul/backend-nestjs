import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Appraisal from 'src/entity/Appraisal';
import { AppraisalController } from './appraisal.controller';
import { AppraisalService } from './appraisal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appraisal])],
  controllers: [AppraisalController],
  providers: [AppraisalService],
})
export class AppraisalModule {}
