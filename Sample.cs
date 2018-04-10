namespace Game.DB 
{
    [TableName("u_user")]
    [PrimaryKey("id", AutoIncrement = false)]
    public class UserInfo 
    {
        public int id { get; set; }
        public int type { get; set; }
        public string name { get; set; }
        public long birthTime { get; set; }
    }
}