import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
    });
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {}

  getBookmarkById(userId: number, bookmarkId: number) {}

  editBookmarkById(userId: number, dto: EditBookmarkDto, bookmarkId: number) {}

  deleteBookmarkById(userId: number, bookmarkId: number) {}
}
