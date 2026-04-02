const { body } = require('express-validator');

const authValidator = {
  // 注册验证规则
  register: [
    body('game_id')
      .trim()
      .notEmpty().withMessage('游戏ID不能为空')
      .isLength({ min: 3, max: 50 }).withMessage('游戏ID长度应在3-50个字符之间'),

    body('username')
      .trim()
      .notEmpty().withMessage('用户名不能为空')
      .isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50个字符之间'),

    body('password')
      .notEmpty().withMessage('密码不能为空')
      .isLength({ min: 6, max: 100 }).withMessage('密码长度应在6-100个字符之间'),

    body('display_name')
      .trim()
      .notEmpty().withMessage('显示名称不能为空')
      .isLength({ min: 1, max: 50 }).withMessage('显示名称长度应在1-50个字符之间'),

    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail().withMessage('邮箱格式不正确')
      .normalizeEmail()
  ],

  // 登录验证规则
  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('用户名不能为空'),

    body('password')
      .notEmpty().withMessage('密码不能为空')
  ],

  // 修改密码验证规则
  changePassword: [
    body('currentPassword')
      .notEmpty().withMessage('当前密码不能为空'),

    body('newPassword')
      .notEmpty().withMessage('新密码不能为空')
      .isLength({ min: 6, max: 100 }).withMessage('新密码长度应在6-100个字符之间')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('新密码不能与当前密码相同');
        }
        return true;
      })
  ]
};

module.exports = authValidator;