'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus, Minus, Leaf, Sprout, Zap, Trees, Flower2, Wallet, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/lib/walletContext';

export interface Plot {
    id: string;
    tower: number;
    level: number;
    rack: string;
    status: 'available' | 'occupied' | 'maintenance' | 'selected';
    cropType: string;
    priceXRP: number;
    estimatedYield: string;
}

interface CartItem extends Plot {
    quantity: number;
}

interface FarmPlotSelectorProps {
    farmName: string;
    totalPlots: number;
    availablePlots: number;
    onPlotSelect?: (plots: CartItem[]) => void;
}

const FarmPlotSelector: React.FC<FarmPlotSelectorProps> = ({
                                                               farmName,
                                                               totalPlots,
                                                               availablePlots,
                                                               onPlotSelect
                                                           }) => {
    const { userWallet, isConnected, isConnecting, connect, sendPayment } = useWallet();
    // Generate plot layout for 4 towers, each with 8 levels and 6 racks per level
    const generatePlots = useCallback((): Plot[] => {
        const plots: Plot[] = [];
        const crops = ['Lettuce', 'Broccoli', 'Microgreens', 'Spinach', 'Kale', 'Herbs'];
        const racks = ['A', 'B', 'C', 'D', 'E', 'F'];

        // Use seeded random to ensure consistent generation between server and client
        let seed = 123456; // Fixed seed for consistent results
        const seededRandom = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        for (let tower = 1; tower <= 4; tower++) {
            for (let level = 1; level <= 8; level++) {
                for (let rackIdx = 0; rackIdx < racks.length; rackIdx++) {
                    const rack = racks[rackIdx];
                    const id = `T${tower}-L${level}-${rack}`;
                    const randomStatus = seededRandom();
                    let status: Plot['status'] = 'available';

                    if (randomStatus > 0.75) status = 'occupied';
                    else if (randomStatus > 0.97) status = 'maintenance';

                    plots.push({
                        id,
                        tower,
                        level,
                        rack,
                        status,
                        cropType: crops[Math.floor(seededRandom() * crops.length)],
                        priceXRP: Number((seededRandom() * 15 + 10).toFixed(1)),
                        estimatedYield: `${(seededRandom() * 2 + 0.5).toFixed(1)}kg`
                    });
                }
            }
        }

        return plots;
    }, []);

    const [plots, setPlots] = useState<Plot[]>(generatePlots);
    const [selectedPlots, setSelectedPlots] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [hoveredPlot, setHoveredPlot] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [showPurchasePreview, setShowPurchasePreview] = useState(false);

    const getCropIcon = (cropType: string) => {
        switch (cropType) {
            case 'Lettuce': return <Leaf className="h-3 w-3" />;
            case 'Broccoli': return <Trees className="h-3 w-3" />;
            case 'Microgreens': return <Sprout className="h-3 w-3" />;
            case 'Spinach': return <Leaf className="h-3 w-3" />;
            case 'Kale': return <Flower2 className="h-3 w-3" />;
            case 'Herbs': return <Sprout className="h-3 w-3" />;
            default: return <Leaf className="h-3 w-3" />;
        }
    };

    const handleConnectWallet = async () => {
        try {
            setPurchaseError(null);
            await connect();
        } catch (error) {
            console.error('Wallet connection failed:', error);
            setPurchaseError(error instanceof Error ? error.message : 'Failed to connect wallet');
        }
    };

    const handlePlotClick = (plot: Plot) => {
        if (plot.status === 'occupied' || plot.status === 'maintenance') return;

        setPlots(prevPlots =>
            prevPlots.map(p =>
                p.id === plot.id
                    ? { ...p, status: p.status === 'selected' ? 'available' : 'selected' }
                    : p
            )
        );

        setSelectedPlots(prevSelected => {
            const existing = prevSelected.find(item => item.id === plot.id);
            if (existing) {
                return prevSelected.filter(item => item.id !== plot.id);
            } else {
                const newItem: CartItem = { ...plot, quantity: 1, status: 'selected' };
                return [...prevSelected, newItem];
            }
        });

        if (!showCart) setShowCart(true);
    };

    const updateQuantity = (plotId: string, change: number) => {
        setSelectedPlots(prevSelected =>
            prevSelected.map(item => {
                if (item.id === plotId) {
                    const newQuantity = Math.max(1, Math.min(5, item.quantity + change));
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const removeFromCart = (plotId: string) => {
        setSelectedPlots(prevSelected => prevSelected.filter(item => item.id !== plotId));
        setPlots(prevPlots =>
            prevPlots.map(p =>
                p.id === plotId ? { ...p, status: 'available' } : p
            )
        );
    };

    const totalXRP = selectedPlots.reduce((sum, item) => sum + (item.priceXRP * item.quantity), 0);
    const totalYield = selectedPlots.reduce((sum, item) => sum + (parseFloat(item.estimatedYield) * item.quantity), 0);

    const handlePurchase = async () => {
        if (!isConnected) {
            setPurchaseError('Please connect your wallet first');
            return;
        }

        if (selectedPlots.length === 0) return;

        setIsProcessing(true);
        setPurchaseError(null);

        try {
            // Convert XRP to drops (1 XRP = 1,000,000 drops)
            const totalDrops = Math.floor(totalXRP * 1000000).toString();

            // Get issuer address from environment
            const issuerAddress = process.env.NEXT_PUBLIC_ISSUER_WALLET_ADDRESS || 'rLSZsVxBP2ZoJgGRqkyCwCs5eg7LaLPhkX';

            // Create memo with plot details
            const plotDetails = selectedPlots.map(p => `${p.id}:${p.quantity}`).join(',');
            const memo = `GrowFi-${farmName}-Plots:${plotDetails}`;

            console.log('Sending payment:', {
                amount: totalDrops,
                destination: issuerAddress,
                memo: memo
            });

            const result = await sendPayment(issuerAddress, totalDrops, memo);

            if (result.success) {
                console.log('Payment successful!', result);

                // Save plot ownership to localStorage
                const existingOwnership = JSON.parse(localStorage.getItem('plotOwnership') || '{}');
                selectedPlots.forEach(plot => {
                    existingOwnership[plot.id] = {
                        farmName,
                        quantity: plot.quantity,
                        purchaseDate: new Date().toISOString(),
                        txHash: result.txHash,
                        priceXRP: plot.priceXRP
                    };
                });
                localStorage.setItem('plotOwnership', JSON.stringify(existingOwnership));

                // Clear selection
                setSelectedPlots([]);
                setPlots(generatePlots());
                setShowCart(false);
                setShowPurchasePreview(false);

                // Call parent callback
                onPlotSelect?.([]);

                alert(`Successfully purchased ${selectedPlots.reduce((sum, item) => sum + item.quantity, 0)} plots! Transaction hash: ${result.txHash}`);
            } else {
                throw new Error(result.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            setPurchaseError(error instanceof Error ? error.message : 'Purchase failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const getPlotStyles = (plot: Plot) => {
        const baseStyles = "relative w-8 h-8 rounded-md border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-xs font-medium";

        switch (plot.status) {
            case 'available':
                return `${baseStyles} bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 hover:scale-110 hover:shadow-lg hover:z-10`;
            case 'selected':
                return `${baseStyles} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-lg scale-105 z-10 animate-pulse`;
            case 'occupied':
                return `${baseStyles} bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-600 cursor-not-allowed opacity-75`;
            case 'maintenance':
                return `${baseStyles} bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700 cursor-not-allowed opacity-75`;
            default:
                return `${baseStyles} bg-gray-100 border-gray-300 text-gray-600`;
        }
    };

    return (
        <div className="flex gap-6 w-full">
            {/* Main Plot Selection Area */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-xl">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">
                                🌱 Growing Tower Selection
                            </h2>
                            <p className="text-slate-600 text-sm">{farmName} • Choose your investment plots</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Selected: {selectedPlots.length}</div>
                            <div className="text-base font-semibold text-slate-700">{totalXRP.toFixed(1)} XRP</div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 p-2 px-3 bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded"></div>
                            <span className="text-sm text-slate-600">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-600 rounded"></div>
                            <span className="text-sm text-slate-600">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded"></div>
                            <span className="text-sm text-slate-600">Occupied</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded"></div>
                            <span className="text-sm text-slate-600">Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* Tower Layout - 2x2 grid, spread evenly */}
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(tower => (
                        <div key={tower} className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 shadow-md flex flex-col items-center">
                            <div className="text-center mb-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg">
                                    <Zap className="h-3 w-3" />
                                    Tower {tower}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Hydroponic Growing System</p>
                            </div>

                            <div className="space-y-1">
                                {[8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                                    <div key={level} className="flex items-center gap-1">
                                        <div className="w-7 flex flex-col items-center">
                                            <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                L{level}
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {['A', 'B', 'C', 'D', 'E', 'F'].map(rack => {
                                                const plot = plots.find(p => p.tower === tower && p.level === level && p.rack === rack);
                                                if (!plot) return null;

                                                return (
                                                    <div
                                                        key={plot.id}
                                                        onClick={() => handlePlotClick(plot)}
                                                        onMouseEnter={() => setHoveredPlot(plot.id)}
                                                        onMouseLeave={() => setHoveredPlot(null)}
                                                        className={getPlotStyles(plot)}
                                                        title={`${plot.id} - ${plot.cropType} - ${plot.priceXRP} XRP - ${plot.estimatedYield}`}
                                                    >
                                                        {/* Crop Icon */}
                                                        <div className={`${plot.status === 'selected' ? 'text-white scale-110' : ''}`}>
                                                            {getCropIcon(plot.cropType)}
                                                        </div>

                                                        {/* Price - hide when selected */}
                                                        {plot.status !== 'selected' && (
                                                            <div className="text-[9px] font-bold text-slate-600">
                                                                {plot.priceXRP}₪
                                                            </div>
                                                        )}

                                                        {/* Selection indicator */}
                                                        {plot.status === 'selected' && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                                            </div>
                                                        )}

                                                        {/* Hover tooltip */}
                                                        {hoveredPlot === plot.id && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl">
                                                                <div className="font-semibold">{plot.cropType}</div>
                                                                <div>Yield: {plot.estimatedYield}</div>
                                                                <div>Price: {plot.priceXRP} XRP</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Cart Sidebar */}
            {showCart && (
                <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden h-fit max-h-[90vh] flex flex-col">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">Investment Cart</h3>
                                <p className="text-blue-100 text-sm">{selectedPlots.length} plots selected</p>
                            </div>
                            <button
                                onClick={() => setShowCart(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {selectedPlots.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Leaf className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="font-medium mb-2">No plots selected</p>
                                <p className="text-sm">Click on available plots to start investing</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 mb-6">
                                    {selectedPlots.map(plot => (
                                        <div key={plot.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                                                        {getCropIcon(plot.cropType)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{plot.id}</div>
                                                        <div className="text-sm text-slate-600">{plot.cropType}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(plot.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(plot.id, -1)}
                                                        className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-colors"
                                                        disabled={plot.quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{plot.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(plot.id, 1)}
                                                        className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center transition-colors"
                                                        disabled={plot.quantity >= 5}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-slate-800">
                                                        {(plot.priceXRP * plot.quantity).toFixed(1)} XRP
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Est. {(parseFloat(plot.estimatedYield) * plot.quantity).toFixed(1)}kg
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 pt-6">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Total Plots:</span>
                                            <span className="font-semibold">{selectedPlots.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Est. Total Yield:</span>
                                            <span className="font-semibold">{totalYield.toFixed(1)}kg</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
                                            <span>Total Investment:</span>
                                            <span className="text-blue-600">{totalXRP.toFixed(1)} XRP</span>
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {purchaseError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-sm">{purchaseError}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Purchase Preview */}
                                    {showPurchasePreview && (
                                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-2">Payment Details</h4>
                                            <div className="text-sm text-blue-700 space-y-1">
                                                <div>Recipient: {process.env.NEXT_PUBLIC_ISSUER_WALLET_ADDRESS?.slice(0, 10)}...</div>
                                                <div>Amount: {totalXRP.toFixed(2)} XRP (≈ {(totalXRP * 1000000).toLocaleString()} drops)</div>
                                                <div>For: {selectedPlots.reduce((sum, item) => sum + item.quantity, 0)} plots</div>
                                            </div>
                                        </div>
                                    )}

                                    {!isConnected ? (
                                        <button
                                            onClick={handleConnectWallet}
                                            disabled={isConnecting}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            <Wallet className="h-5 w-5" />
                                            {isConnecting ? 'Connecting...' : 'Connect Wallet to Purchase'}
                                        </button>
                                    ) : showPurchasePreview ? (
                                        <div className="space-y-2">
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isProcessing}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wallet className="h-5 w-5" />
                                                        Confirm Purchase
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowPurchasePreview(false)}
                                                className="w-full text-slate-600 hover:text-slate-800 py-2 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowPurchasePreview(true)}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Proceed to Investment →
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmPlotSelector;