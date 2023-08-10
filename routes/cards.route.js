const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const { Cards } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const router = express.Router();
// 칼럼 내 카드 조회
router.get('/:columnId/card', async (req, res) => {
  try {
    const columnId = req.params.columnId;
    // order 값을 기준으로 오름차순
    const cards = await Cards.findAll({
      where: { columnId },
      order: [['order', 'ASC']],
    });
    console.log('columnId = ', columnId)
    res.status(200).json({datas: cards});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '카드 조회 중 오류가 발생했습니다.' });
  }
});
// 카드 생성
router.post('/card', authMiddleware, async (req, res) => {
  try {
    const { columnId, name, content, color, endDate } = req.body;
    const userId = res.locals.user.userId;
    // 사용자가 입력한 endDate 값을 new Date()를 사용하여 JavaScript의 Date 객체로 변환, endDate를 입력하지 않으면 null
    const parsedEndDate = endDate ? new Date(endDate) : null;
    // 현재 날짜와 시간을 나타내는 Date 객체를 생성
    const currentDate = new Date();
    // parsedEndDate가 null이 아닌 경우, 즉 사용자가 마감일을 입력한 경우에만 아래 코드 블록을 실행
    if (parsedEndDate) {
      // parsedEndDate의 연도를 현재 연도로 설정
      // ex) dateObj.setFullYear(2023, 7, 10)은 dateObj의 연도를 2023으로 설정하고, 월을 7로(8월) 설정하며, 일을 10으로 설정합니다.
      parsedEndDate.setFullYear(currentDate.getFullYear());
      // 만약 parsedEndDate가 현재 날짜보다 작은 경우 parsedEndDate의 연도를 현재 연도에 1을 더한 연도로 설정합니다.
      if (parsedEndDate < currentDate) {
        parsedEndDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
    const maxOrder = await Cards.max('order', { where: { columnId } });
    const newCard = await Cards.create({
      columnId,
      userId,
      name,
      content,
      color,
      endDate: parsedEndDate,
      order: maxOrder !== null ? maxOrder + 1 : 1,
    });
    res.status(201).json(newCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '카드 생성 중 오류가 발생했습니다.' });
  }
});
// 카드 내용 수정
router.put('/card/:cardId', authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const { name, content, color, endDate } = req.body;
    const userId = res.locals.user.userId;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const currentDate = new Date();
    if (parsedEndDate) {
      parsedEndDate.setFullYear(currentDate.getFullYear());
      if (parsedEndDate < currentDate) {
        parsedEndDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
    const [updatedRowCount] = await Cards.update(
      { name, content, color, userId, endDate: parsedEndDate },
      { where: { cardId } },
    );
    if (updatedRowCount === 0) {
      return res.status(404).json({ error: '해당 카드를 찾을 수 없습니다.' });
    }
    const updatedCard = await Cards.findByPk(cardId);
    res.status(200).json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '카드 수정 중 오류가 발생했습니다.' });
  }
});
// 카드 삭제
router.delete('/card/:cardId', authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const deletedRowCount = await Cards.destroy({ where: { cardId } });
    if (deletedRowCount === 0) {
      return res.status(404).json({ error: '해당 카드를 찾을 수 없습니다.' });
    }
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '카드 삭제 중 오류가 발생했습니다.' });
  }
});
// 카드 위치 수정
router.put('/card/move/:cardId', authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const { columnId, newOrder } = req.body;
    const card = await Cards.findOne({ where: { cardId } });
    if (card.columnId !== columnId) {
      // 다른 칼럼으로 이동할 경우
      await sequelize.transaction(async (transaction) => {
        await Cards.update(
          { order: sequelize.literal(`\`order\` - 1`) },
          {
            where: {
              columnId: card.columnId,
              order: { [Op.gt]: card.order },
            },
            transaction,
          },
        );
        await Cards.update(
          { order: sequelize.literal(`\`order\` + 1`) },
          {
            where: {
              columnId,
              order: { [Op.gte]: newOrder },
            },
            transaction,
          },
        );
        await Cards.update(
          { order: newOrder, columnId },
          {
            where: { cardId },
            transaction,
          },
        );
      });
    } else {
      // 같은 칼럼 내에서의 이동
      await sequelize.transaction(async (transaction) => {
        if (newOrder < card.order) {
          await Cards.update(
            { order: sequelize.literal(`\`order\` + 1`) },
            {
              where: {
                columnId,
                order: { [Op.gte]: newOrder, [Op.lt]: card.order },
              },
              transaction,
            },
          );
        } else if (newOrder > card.order) {
          await Cards.update(
            { order: sequelize.literal(`\`order\` - 1`) },
            {
              where: {
                columnId,
                order: { [Op.gt]: card.order, [Op.lte]: newOrder },
              },
              transaction,
            },
          );
        }
        await Cards.update(
          { order: newOrder },
          {
            where: { cardId, columnId },
            transaction,
          },
        );
      });
    }
    console.log('카드 이동 완료');
    res.status(200).json({ message: '카드가 이동되었습니다.' });
  } catch (error) {
    console.error('카드 이동 중 오류:', error);
    res.status(500).json({ error: '카드 이동 중 오류가 발생했습니다.' });
  }
});
module.exports = router;