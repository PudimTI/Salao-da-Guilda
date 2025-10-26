import React, { useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contador Interativo
            </h2>
            <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                    {count}
                </div>
                <p className="text-gray-600">
                    Clique nos botões para alterar o valor
                </p>
            </div>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={decrement}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                    -
                </button>
                <button
                    onClick={reset}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                    Reset
                </button>
                <button
                    onClick={increment}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default Counter;