import { Request, Response } from 'express'
import analyticsService from '~/services/analytics.services'

export const getOverviewController = async (req: Request, res: Response) => {
  const result = await analyticsService.getOverview()
  return res.json({ message: 'Lấy số liệu tổng quan thành công', result })
}

export const getNewUsersStatsController = async (req: Request, res: Response) => {
  const { period } = req.query as { period: '7days' | '30days' | 'year' }
  const result = await analyticsService.getNewUserStats(period)
  return res.json({ message: 'Lấy thống kê người dùng thành công', result })
}

export const getTopContentController = async (req: Request, res: Response) => {
  const result = await analyticsService.getTopContent()
  return res.json({ message: 'Lấy top nội dung thành công', result })
}

export const exportReportController = async (req: Request, res: Response) => {
  const csvData = await analyticsService.generateReportCSV()
  
  // Set headers để trình duyệt hiểu đây là file tải về
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=report_users.csv')
  
  return res.status(200).send(csvData)
}