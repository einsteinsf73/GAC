using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Xml;

namespace CadastroClientes.Controllers
{
    public class ClienteController : Controller
    {
        private readonly string databasePath = "database.json";

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult AdicionarCliente([FromBody] Cliente cliente)
        {
            var jsonString = System.IO.File.ReadAllText(databasePath);
            var database = JsonConvert.DeserializeObject<Database>(jsonString) ?? new Database();

            database.Clientes.Add(cliente);

            System.IO.File.WriteAllText(databasePath, JsonConvert.SerializeObject(database, Newtonsoft.Json.Formatting.Indented));

            return Json(new { message = "Cliente adicionado com sucesso." });
        }
    }
}
