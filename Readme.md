## Mysql -> C#



> Mysql data

```
-- 导出  表 test.u_user 结构
CREATE TABLE IF NOT EXISTS `u_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='u_user';

-- 正在导出表  test.u_user 的数据：~0 rows (大约)
DELETE FROM `u_user`;
/*!40000 ALTER TABLE `u_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `u_user` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
```

> CSharp

```
namespace Game.Entity.User
{
	[TableName("u_user")]
	[PrimaryKey("id", AutoIncrement = true)]
	public class User
	{
		public int id { get; set; } // 
		public string name { get; set; } // 
	}
}
```

