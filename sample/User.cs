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
