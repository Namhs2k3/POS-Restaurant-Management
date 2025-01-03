import { useState, useEffect } from "react";
import SidebarCart from "./SidebarCart";
import OrderMenu from "./OrderMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";

const OrderTable = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [secondSelectedTable, setSecondSelectedTable] = useState(null); // Bàn thứ 2 được chọn
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false); // Modal xác nhận chuyển bàn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to fetch tables
  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tables");
      if (response.data.success) {
        const updatedTables = response.data.data.map((table) => {
          // Kiểm tra nếu bàn có sản phẩm trong giỏ
          if (table.cart && table.cart.length > 0) {
            table.status = 2; // Đặt trạng thái là 2 nếu có sản phẩm
          } else {
            table.status = 1; // Đặt trạng thái là 1 nếu không có sản phẩm
          }
          return table;
        });
        setTables(updatedTables); // Cập nhật danh sách bàn vào state
      } else {
        toast.error("Không thể lấy danh sách bàn.");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Có lỗi xảy ra khi lấy danh sách bàn.");
    }
  };

  // Lấy danh sách bàn và tiếp tục cập nhật mỗi 2 giây
  useEffect(() => {
    fetchTables(); // Fetch tables initially
    const intervalId = setInterval(fetchTables, 2000); // Fetch every 2 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs once on mount

  // Xử lý thay đổi trạng thái bàn
  const handleTableClick = (table) => {
    if (selectedTable?._id === table._id) {
      setSelectedTable(null); // Nếu bàn đầu tiên đang được chọn, bỏ chọn
    } else if (secondSelectedTable?._id === table._id) {
      setSecondSelectedTable(null); // Nếu bàn thứ hai đang được chọn, bỏ chọn
    } else {
      if (!selectedTable) {
        setSelectedTable(table); // Chọn bàn đầu tiên
      } else {
        setSecondSelectedTable(table); // Chọn bàn thứ hai
      }
    }
  };

  const handleOpenSwapModal = () => {
    if (selectedTable && secondSelectedTable) {
      setIsSwapModalOpen(true); // Mở modal xác nhận chuyển bàn
    } else {
      toast.error("Bạn cần chọn hai bàn để chuyển.");
    }
  };

  const handleSwapTables = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/tables/swap",
        {
          tableId1: selectedTable._id,
          tableId2: secondSelectedTable._id,
        },
      );

      if (response.data.success) {
        toast.success("Chuyển bàn thành công!");
        fetchTables(); // Cập nhật danh sách bàn
        setIsSwapModalOpen(false); // Đóng modal xác nhận
        setSelectedTable(null); // Xóa bàn đã chọn
        setSecondSelectedTable(null); // Xóa bàn thứ 2 đã chọn
      }
    } catch (error) {
      console.error("Error swapping tables:", error);
      toast.error("Có lỗi xảy ra khi chuyển bàn.");
    }
  };

  // Xử lý mở modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Xử lý tạo bàn mới
  const handleAddTable = async () => {
    try {
      const newTable = {
        name: `${tables.length + 1}`,
        CartItem: [],
        status: 1,
      };

      // Gửi yêu cầu POST đến API để tạo bàn mới
      const response = await axios.post(
        "http://localhost:5000/api/tables",
        newTable,
      ); // Cập nhật URL API phù hợp

      if (response.data.success) {
        // Cập nhật danh sách bàn khi bàn mới được tạo thành công
        setTables([...tables, response.data.data]);
        setIsModalOpen(false);
        toast.success("Bàn mới đã được thêm thành công!"); // Thông báo thành công
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Có lỗi xảy ra khi thêm bàn mới."); // Thông báo lỗi
    }
  };

  const handleViewCart = () => {
    let activeTable = null;

    if (selectedTable && secondSelectedTable) {
      toast.error(
        "Chỉ có thể xem giỏ hàng cho một bàn. Vui lòng bỏ chọn một bàn.",
      );
      return;
    } else if (selectedTable) {
      activeTable = selectedTable; // Nếu có bàn đầu tiên được chọn
    } else if (secondSelectedTable) {
      activeTable = secondSelectedTable; // Nếu có bàn thứ hai được chọn
    } else {
      toast.error("Hãy chọn một bàn để xem giỏ hàng.");
      return;
    }

    setIsSidebarOpen(true); // Mở giỏ hàng
    console.log("Đang mở giỏ hàng của bàn:", activeTable.name); // Debug
  };

  const handleSendRequest = async () => {
    // Kiểm tra nếu không có bàn được chọn
    if (!selectedTable && !secondSelectedTable) {
      toast.error("Vui lòng chọn bàn để gửi món.");
      return;
    }

    const tablesToSendRequest = []; // Mảng lưu các bàn cần gửi yêu cầu

    // Kiểm tra nếu có bàn được chọn
    if (selectedTable) {
      tablesToSendRequest.push(selectedTable);
    }
    if (secondSelectedTable) {
      tablesToSendRequest.push(secondSelectedTable);
    }

    // Lặp qua các bàn đã chọn để kiểm tra và gửi yêu cầu
    for (let table of tablesToSendRequest) {
      try {
        const tableResponse = await axios.get(
          `http://localhost:5000/api/tables/${table._id}`,
        );
        const updatedTable = tableResponse.data.data;

        if (updatedTable.cart && updatedTable.cart.length === 0) {
          toast.error(
            `Bàn ${table.name} không có món trong giỏ. Vui lòng chọn bàn có món.`,
          );
          continue; // Bỏ qua bàn này nếu không có món
        }

        // Kiểm tra quantity và finalQuantity cho từng món
        let allItemsServed = true; // Biến kiểm tra xem tất cả các món đều đã được phục vụ chưa
        updatedTable.cart.forEach((cartItem) => {
          cartItem.statusProduct.forEach((status) => {
            if (status.doneQuantity < cartItem.quantity) {
              allItemsServed = false; // Nếu có món chưa hoàn thành, cho phép gửi yêu cầu
            }
          });
        });

        if (allItemsServed) {
          toast.info(`Các món ở bàn ${table.name} đã được phục vụ.`);
        } else {
          // Chỉ gửi yêu cầu nếu có món chưa được phục vụ hết
          const response = await axios.put(
            `http://localhost:5000/api/tables/${table._id}/sendRequest`,
          );
          if (response.data.success) {
            toast.success(`Đã gửi yêu cầu làm món.`);
            fetchTables(); // Cập nhật lại danh sách bàn
          } else {
            toast.error(`Có lỗi xảy ra khi gửi yêu cầu cho bàn ${table.name}.`);
          }
        }
      } catch (error) {
        console.error(`Error sending request for table ${table.name}:`, error);
        toast.error(`Có lỗi xảy ra khi gửi yêu cầu cho bàn ${table.name}.`);
      }
    }
  };

  return (
    <div className="flex">
      {/* Bên trái: Danh sách bàn */}
      <div className="flex w-5/12 flex-col border-r border-gray-300 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-josefin text-2xl font-bold">Danh sách bàn</h2>
          <button
            className="bg-[#633c02] px-4 py-3 font-bold text-white transition-transform duration-200 hover:scale-90"
            onClick={handleOpenSwapModal}
          >
            Chuyển bàn
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid max-h-[500px] grid-cols-3 items-start gap-4">
            {tables.map((table) => (
              <div
                key={table._id} // Sử dụng _id từ MongoDB
                className={`flex h-20 w-40 cursor-pointer items-center justify-center border text-center font-josefin text-2xl font-bold ${
                  selectedTable?._id === table._id
                    ? "bg-[#633c02] text-white" // Màu nâu đậm khi bàn đầu tiên được chọn
                    : secondSelectedTable?._id === table._id
                      ? "bg-[#633c02] text-white" // Màu nâu đậm khi bàn thứ hai được chọn
                      : table.status === 2
                        ? "bg-[#dea58d] text-gray-800" // Màu nâu nhạt khi bàn có sản phẩm
                        : "bg-white text-gray-800" // Màu trắng khi bàn trống
                } hover:bg-[#d88453]`}
                onClick={() => handleTableClick(table)} // Chọn hoặc bỏ chọn bàn
              >
                Bàn {table.name}
              </div>
            ))}

            {/* Ô thêm bàn */}
            <div
              className="flex h-20 w-40 cursor-pointer items-center justify-center border bg-gray-100 text-center text-green-800 hover:bg-black hover:text-white"
              onClick={handleOpenModal}
            >
              <span className="text-3xl font-bold">
                <FontAwesomeIcon icon={faPlusCircle} />
              </span>
            </div>
          </div>
        </div>

        {/* Nút xem giỏ hàng */}
        <div className="flex">
          <button
            className="mx-4 mt-4 w-full bg-black py-3 text-lg font-bold text-white transition-transform duration-200 hover:scale-90"
            onClick={handleViewCart} // Gọi hàm kiểm tra chọn bàn và mở giỏ hàng
          >
            Xem giỏ hàng
          </button>
          <button
            className="mx-4 mt-4 w-full bg-black py-3 text-lg font-bold text-white transition-transform duration-200 hover:scale-90"
            onClick={handleSendRequest}
          >
            Gửi món
          </button>
        </div>
      </div>

      {/* Bên phải: Thực đơn */}
      <div className="w-2/3">
        <OrderMenu
          selectedTable={selectedTable}
          secondSelectedTable={secondSelectedTable}
        />
      </div>

      <SidebarCart
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedTable={selectedTable || secondSelectedTable}
      />

      {/* Modal xác nhận */}

      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-80 w-full max-w-2xl flex-col items-center justify-center space-y-4 rounded-lg bg-white p-6 shadow-lg">
            <span className="mb-4 text-5xl font-bold text-black">
              <FontAwesomeIcon icon={faCircleInfo} />
            </span>

            <h3 className="text-center font-oswald text-4xl font-bold text-gray-800">
              Bạn có muốn chuyển bàn không?
            </h3>

            <span className="text-center font-josefin text-2xl font-bold text-gray-800">
              Bàn {selectedTable?.name} và Bàn {secondSelectedTable?.name} sẽ
              được chuyển cho nhau.
            </span>

            <div className="flex">
              <button
                className="mr-16 mt-4 bg-gray-300 px-14 pb-3 pt-4 text-xl font-bold text-gray-800 transition-transform duration-200 hover:scale-90"
                onClick={() => setIsSwapModalOpen(false)} // Đóng modal nếu không đồng ý
              >
                Hủy
              </button>
              <button
                className="mt-4 bg-[#633c02] px-14 pb-3 pt-4 text-xl font-bold text-white transition-transform duration-200 hover:scale-90"
                onClick={handleSwapTables} // Gọi API để chuyển bàn
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-80 w-full max-w-2xl flex-col items-center justify-center space-y-4 rounded-lg bg-white p-6 shadow-lg">
            {/* Icon */}
            <span className="mb-4 text-5xl font-bold text-black">
              <FontAwesomeIcon icon={faCircleInfo} />
            </span>

            {/* Tiêu đề */}
            <h3 className="text-center font-oswald text-4xl font-bold text-gray-800">
              Bạn có muốn tạo thêm bàn mới?
            </h3>

            <span className="text-center font-josefin text-2xl font-bold text-gray-800">
              Bạn chỉ có thể xóa ở trang quản lý!!!
            </span>

            {/* Nút lựa chọn */}
            <div className="flex">
              <button
                className="mr-16 mt-4 bg-gray-300 px-14 pb-3 pt-4 text-xl font-bold text-gray-800 transition-transform duration-200 hover:scale-90"
                onClick={handleCloseModal}
              >
                Không
              </button>
              <button
                className="mt-4 bg-[#633c02] px-14 pb-3 pt-4 text-xl font-bold text-white transition-transform duration-200 hover:scale-90"
                onClick={handleAddTable}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
