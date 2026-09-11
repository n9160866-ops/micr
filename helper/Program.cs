// Helper console app : lit les capteurs matériels via LibreHardwareMonitorLib
// et affiche un snapshot JSON sur stdout à chaque appel.
// Compilé en exe autonome par le workflow GitHub Actions (dotnet publish).

using System;
using System.Collections.Generic;
using System.Text.Json;
using LibreHardwareMonitor.Hardware;

class UpdateVisitor : IVisitor
{
    public void VisitComputer(IComputer computer) => computer.Traverse(this);

    public void VisitHardware(IHardware hardware)
    {
        hardware.Update();
        foreach (IHardware sub in hardware.SubHardware)
            sub.Accept(this);
    }

    public void VisitSensor(ISensor sensor) { }
    public void VisitParameter(IParameter parameter) { }
}

class SensorReading
{
    public string Name { get; set; } = "";
    public double Value { get; set; }
}

class Snapshot
{
    public List<SensorReading> CpuCores { get; set; } = new();
    public List<SensorReading> CpuFans { get; set; } = new();
    public List<SensorReading> CaseFans { get; set; } = new();
    public List<SensorReading> GpuTemps { get; set; } = new();
    public List<SensorReading> GpuFans { get; set; } = new();
    public string? Error { get; set; }
}

class Program
{
    static void Main()
    {
        var snapshot = new Snapshot();

        try
        {
            var computer = new Computer
            {
                IsCpuEnabled = true,
                IsGpuEnabled = true,
                IsMotherboardEnabled = true,
                IsMemoryEnabled = false,
                IsStorageEnabled = false
            };

            computer.Open();
            computer.Accept(new UpdateVisitor());

            foreach (IHardware hardware in computer.Hardware)
            {
                if (hardware.HardwareType == HardwareType.Cpu)
                {
                    foreach (ISensor sensor in hardware.Sensors)
                    {
                        if (sensor.SensorType == SensorType.Temperature && sensor.Value.HasValue && sensor.Name.Contains("Core"))
                            snapshot.CpuCores.Add(new SensorReading { Name = sensor.Name, Value = Math.Round(sensor.Value.Value, 1) });

                        if (sensor.SensorType == SensorType.Fan && sensor.Value.HasValue)
                            snapshot.CpuFans.Add(new SensorReading { Name = sensor.Name, Value = Math.Round(sensor.Value.Value, 0) });
                    }
                }
                else if (hardware.HardwareType == HardwareType.GpuNvidia ||
                         hardware.HardwareType == HardwareType.GpuAmd ||
                         hardware.HardwareType == HardwareType.GpuIntel)
                {
                    foreach (ISensor sensor in hardware.Sensors)
                    {
                        if (sensor.SensorType == SensorType.Temperature && sensor.Value.HasValue)
                            snapshot.GpuTemps.Add(new SensorReading { Name = sensor.Name, Value = Math.Round(sensor.Value.Value, 1) });

                        if (sensor.SensorType == SensorType.Fan && sensor.Value.HasValue)
                            snapshot.GpuFans.Add(new SensorReading { Name = sensor.Name, Value = Math.Round(sensor.Value.Value, 0) });
                    }
                }
                else if (hardware.HardwareType == HardwareType.Motherboard)
                {
                    foreach (IHardware sub in hardware.SubHardware)
                    {
                        sub.Update();
                        foreach (ISensor sensor in sub.Sensors)
                        {
                            if (sensor.SensorType == SensorType.Fan && sensor.Value.HasValue)
                                snapshot.CaseFans.Add(new SensorReading { Name = sensor.Name, Value = Math.Round(sensor.Value.Value, 0) });
                        }
                    }
                }
            }

            computer.Close();
        }
        catch (Exception ex)
        {
            snapshot.Error = ex.Message + " (lance l'app en tant qu'administrateur)";
        }

        Console.WriteLine(JsonSerializer.Serialize(snapshot));
    }
}
