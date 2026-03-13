/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { HttpException, Injectable } from '@nestjs/common';
import axios, { type AxiosRequestConfig,AxiosResponse, CanceledError } from 'axios';

@Injectable()
export class HttpService {
  private throwHttpException(error: unknown): never {
    if (axios.isAxiosError(error) && error.response) {
      throw new HttpException(error.response.data, error.response.status);
    }

    throw new HttpException('Unexpected HTTP error', 500);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.get<T>(url, config);
    } catch (error) {
      this.throwHttpException(error);
    }
  }

  async post<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.post<T>(url, data, config);
    } catch (error) {
      this.throwHttpException(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.delete<T>(url, config);
    } catch (error) {
      this.throwHttpException(error);
    }
  }

  async patch<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.patch<T>(url, data, config);
    } catch (error) {
      this.throwHttpException(error);
    }
  }

  async head<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.head<T>(url, config);
    } catch (error: unknown) {
      if (error instanceof CanceledError) {
        throw error;
      }
      this.throwHttpException(error);
    }
  }
}
