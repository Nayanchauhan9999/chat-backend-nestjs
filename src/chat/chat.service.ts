import { Body, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  async create(@Body() createChatDto: CreateChatDto): Promise<string> {
    const client = new OpenAI({
      apiKey: '',
      baseURL: 'http://localhost:12434/engines/llama.cpp/v1',
    });
    try {
      const response = await client.chat.completions.create({
        model: 'ai/gemma3:270M-F16',
        messages: [{ role: 'user', content: createChatDto.message }],
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      return JSON.stringify(error);
    }
  }
}
