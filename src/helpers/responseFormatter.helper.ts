import { Response } from 'express'

const ResponseFormatter = {
  success: (res: Response, { status = 200, message = 'success', data = null, meta = null }: any) => {
    return res.json({
      statusCode: status,
      success: true,
      data,
      meta,
      message
    })
  },

  failed: (res: Response, { status = 403, message = "error", data = null, meta = null }: any) => {
    return res.status(status).json({
      statusCode: status,
      success: false,
      message
    })
  }
}

export default ResponseFormatter
