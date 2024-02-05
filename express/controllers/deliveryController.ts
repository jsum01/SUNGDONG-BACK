import { Request, Response } from "express";
import { QueryError, ResultSetHeader, RowDataPacket } from "mysql2";
import Delivery from "../models/delivery.model";

const deliveryController = {
  // 모든 배송 데이터 조회
  deliveryAll: async (req: Request, res: Response) => {
    const currentPage = parseInt(req.query.page as string, 10) || 1; // 페이지 번호 쿼리 파라미터를 읽어옴
    const itemsPerPage = parseInt(req.query.pagePosts as string, 10) || 20; // 페이지 당 아이템 개수 쿼리 파라미터를 읽어옴

    // 데이터베이스에서 불러오기
    Delivery.getDeliveries(currentPage, itemsPerPage, (err: { message: any; }, data: ResultSetHeader | RowDataPacket | RowDataPacket[] | null) => {
      // 클라이언트에서 보낸 JSON 데이터를 받음
      if (err)
        return res.status(500).send({ message: err.message || "상품을 갱신하는 중 서버 오류가 발생했 습니다." });
      else {
        return res.status(200).json({ message: '성공적으로 상품 갱신이 완료 되었습니다.', success: true, data });
      }
    })
  },



  // 배송상태 변경사항 적용
  applyEditedState: async (req: Request, res: Response) => {
    try {
      // 요청에서 변경된 배송 상태 데이터 추출
      const fetchedData = req.body;

      // 유효성 검사: 변경된 배송 상태 데이터가 유효한지 확인
      if (!Array.isArray(fetchedData)) {
        return res.status(400).json({ message: "잘못된 데이터 형식입니다." });
      }

      // 데이터 처리: 변경된 배송 상태 데이터를 데이터베이스에 업데이트
      await Promise.all(fetchedData.map(async (item: { order_id: string, orderState: number }) => {
        await Delivery.updateDeliveryState(item.order_id, item.orderState);
      }));

      // 응답 전송: 업데이트 성공
      return res.status(200).json({ message: "배송 상태가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      // 응답 전송: 업데이트 실패
      console.error("배송 상태 업데이트 중 오류가 발생했습니다:", error);
      return res.status(500).json({ message: "배송 상태 업데이트 중 오류가 발생했습니다." });
    }
  },

  // 송장수정 변경사항 적용
  applyEditedInvoice: async (req: Request, res: Response) => {
    try {
      // 요청에서 변경된 배송 상태 데이터 추출
      const fetchedData = req.body;

      // 유효성 검사: 변경된 배송 상태 데이터가 유효한지 확인
      if (!Array.isArray(fetchedData)) {
        return res.status(400).json({ message: "잘못된 데이터 형식입니다." });
      }

      // 데이터 처리: 변경된 배송 상태 데이터를 데이터베이스에 업데이트
      await Promise.all(fetchedData.map(async (item: { order_id: string, delivery_selectedCor: string, delivery_num: string }) => {
        await Delivery.updateDeliveryInvoice(item.order_id, item.delivery_selectedCor, item.delivery_num);
      }));

      // 응답 전송: 업데이트 성공
      return res.status(200).json({ message: "배송 상태가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      // 응답 전송: 업데이트 실패
      console.error("배송 상태 업데이트 중 오류가 발생했습니다:", error);
      return res.status(500).json({ message: "배송 상태 업데이트 중 오류가 발생했습니다." });
    }
  },

  // 삭제 작업
  delete: async (req: Request, res: Response) => {
    const orderIds = req.params.ids.split(',').map(String);
    Delivery.deleteByIds(orderIds, (err: { message: any; }) => {
      // 클라이언트에서 보낸 JSON 데이터를 받음
      if (err)
        return res.status(500).send({ message: err.message || "상품을 갱신하는 중 서버 오류가 발생했습니다." });
      else {
        return res.status(200).json({ message: '성공적으로 상품 삭제가 완료 되었습니다.', success: true });
      }
    })
  }
};

export default deliveryController;
